# Hotel Online Admin Dashboard

## What this project does

This project is a restaurant administration system for managing orders, menus, shops, and revenue analytics. It provides a Spring Boot backend with secured REST APIs and a React/Vite frontend for authenticated admin users to view dashboard insights, manage menu items/groups, handle orders, and export reports.

## Tech Stack

- Backend: Spring Boot 3.5.7, Spring Security, Spring Data JPA, MySQL, Maven
- Frontend: React 19, Vite, React Router 7, Axios
- Libraries: Lombok, Apache POI, OpenPDF
- Database: MySQL

## Key Features

- Secured admin authentication with Spring Security
- REST API endpoints for menu, menu group, and order management
- Role-based admin access control for `/api/admin/**`
- Order creation and order detail retrieval
- Menu and menu group CRUD operations
- Revenue analytics: daily, weekly, monthly, yearly, and custom date range
- Top groups and top menu item reporting
- Export dashboard/report data to Excel and PDF
- CORS configuration for React frontend integration

## Architecture

- `Backend/src/main/java/com/Chinmay/Hotel/Controller`: REST controllers for auth, orders, admin dashboard, analytics, menus, and menu groups
- `Backend/src/main/java/com/Chinmay/Hotel/Service`: business logic and service interfaces/implementations
- `Backend/src/main/java/com/Chinmay/Hotel/Repository`: JPA repositories for entities
- `Backend/src/main/java/com/Chinmay/Hotel/Entity`: domain models such as `Orders`, `OrderItems`, `Menu`, `MenuGroup`, `Shops`, `SystemUsers`
- `Backend/src/main/java/com/Chinmay/Hotel/config`: security configuration and CORS setup
- `Frontend/src`: React app with login page, protected admin layout, dashboard pages, order views, revenue analytics, and export pages

## Running the project

1. Start MySQL and configure connection in `Backend/src/main/resources/application.properties`
2. Run backend:
   - `cd Backend`
   - `./mvnw spring-boot:run`
3. Run frontend:
   - `cd Frontend`
   - `npm install`
   - `npm run dev`

## Notes

- Backend uses basic authentication and expects the frontend to send credentials via `Authorization` header
- Frontend stores the auth token in `localStorage` and sends it with Axios requests
- Dashboard endpoints are protected and require `ADMIN` role



10-10-2026

# Excel Order Import — Development & Issue Resolution Log

Documentation date: 9 October 2026

Project: Maharashtrian Thali — Restaurant Management System Module: Admin Excel Order Import Backend: Java 21, Spring Boot, Spring Data JPA, Hibernate, MySQL, Spring Security

## 1. Objective of the Excel Import module

The purpose of this feature is to import historical restaurant orders and their items from an Excel spreadsheet into the existing restaurant management system.

The import must preserve historical order information, validate all references against existing database records, associate the import with the logged-in administrator, and prevent invalid data from being inserted.

The selected design uses a validate-first, then import workflow. Excel data references existing System Users, Shops, Menu Groups, and Menu Items. It does not create those master records.

## 2. Excel file format

The current Excel template uses 10 columns in this order:

| Column | Field       | Handling                                             |
| ------ | ----------- | ---------------------------------------------------- |
| A      | System User | Order-level; may inherit the previous nonblank value |
| B      | Shop        | Order-level; may inherit the previous nonblank value |
| C      | Order Ref   | Order-level; may inherit the previous nonblank value |
| D      | Order Date  | Order-level; may inherit the previous nonblank value |
| E      | Status      | Order-level; may inherit the previous nonblank value |
| F      | Payment     | Order-level; may inherit the previous nonblank value |
| G      | Menu Group  | Required for each item row                           |
| H      | Menu Item   | Required for each item row                           |
| I      | Qty         | Required for each item row                           |
| J      | Price       | Required for each item row                           |

### Why this format was selected

A single order can contain multiple menu items. Repeating all order-level information on every line would make the spreadsheet unnecessarily repetitive.

Instead, the reader supports a hybrid format: order-level values can be inherited from the preceding row, while each item's group, name, quantity, and price must be explicitly supplied.

Internally, the reader normalizes rows into complete DTOs before validation. This makes subsequent validation and importing easier to reason about.

## 3. Implemented architecture

1. Upload Excel file

Admin sends a multipart file request

2. Read and normalize

AdminExcelOrderReader

3. Validate all rows

AdminExcelOrderValidator

4. Import valid data

AdminExcelOrderImportService

Orders + Items

Import batch audit

The main classes and their responsibilities are:

* `AdminExcelOrderReader` — reads the spreadsheet, converts cell values, handles inherited order-level fields, and normalizes the data.

* `AdminExcelOrderValidator` — checks required fields, valid values, relationships, and consistency across rows belonging to the same order.

* `AdminExcelOrderImportService` — validates again before importing, groups rows into orders, constructs `Orders` and `OrderItems`, calculates totals, and records the import batch.

* `AdminExcelOrderImportController` — exposes the validation and import endpoints.

* `ExcelImportBatch` — represents the audit record for one import operation.

* `ExcelImportBatchRepository` — persists and retrieves import batch records.

## 4. Validation rules implemented

The validation stage checks the spreadsheet before any order records are inserted by the import operation.

### 4.1 Required fields and accepted values

* Required order-level and item-level values must be present after normalization.

* Status must be one of `PAID`, `ACTIVE`, or `CANCELLED`.

* Payment mode must be `CASH` or `ONLINE`.

* Quantity must be greater than zero.

* Price must be present, parseable as a number, and nonnegative.

### 4.2 Order-level consistency

A `Map<String, AdminExcelOrderRowDTO>` tracks the first row associated with each Order Ref. Subsequent rows with the same reference are checked against that first row.

The fields that must remain consistent are:

* System User

* Shop

* Order Date

* Status

* Payment

Problem encountered: The same order could previously have different payment modes across its item rows, such as `ONLINE` on one row and `CASH` on another.

Resolution: The validator now checks payment consistency, along with the other order-level fields. An inconsistent order is rejected instead of being imported with ambiguous order-level data.

### 4.3 Database relationship validation

The validator does not merely check whether names exist. It checks the relevant relationships:

* The System User exists.

* The Shop exists.

* The System User belongs to that Shop.

* The Menu Group belongs to that Shop.

* The Menu Item belongs to the selected Shop and Menu Group.

This prevents a valid menu item from another shop or another group from being accepted accidentally.

For example, a nonexistent item such as `COCKROACH MASALA` should be rejected.

### 4.4 Historical price handling

Decision: The Excel price is the historical selling price for the imported order item.

The importer uses:

Java

```
orderItem.setPriceAtPurchase(row.getPrice());
```

It does not require the imported price to equal the current menu price. A menu item's price may have changed since the historical order was placed, and importing that current price instead would corrupt the historical record.

The order total is calculated by multiplying each item's quantity by its historical purchase price and adding the item totals.

## 5. Import workflow and database behavior

The service uses `@Transactional` on the import method. It re-reads and validates the entire file before creating orders. If validation fails, the method returns the validation result before entering the order-creation loop.

For valid data, the importer groups rows by trimmed Order Ref. Each unique reference creates one `Orders` record, and each item row becomes an `OrderItems` record associated with that order.

The implementation also:

* Resolves the user and shop for each order.

* Converts status and payment strings into their corresponding enums.

* Sets `paymentTime` to the order date for `PAID` orders and leaves it null for `ACTIVE` or `CANCELLED` orders.

* Generates a new internal UUID for each imported order.

* Sets `sourceDeviceId` to `EXCEL_IMPORT`.

* Sets the sync time to the current time.

* Uses cascade persistence from `Orders` to its associated `OrderItems`.

### Important identifier distinction

* `DEVICE_ORDER_UUID` uniquely identifies an order internally. It is not the Excel Order Ref and is not a row identifier.

* `SOURCE_DEVICE_ID` identifies the source of the order. For these imports, it is `EXCEL_IMPORT`.

* `Order Ref` groups spreadsheet rows into the same business order during import.

The design deliberately does not add an Order Ref column to `ORDERS` as a shortcut for duplicate detection.

## 6. Import batch audit feature

The `ExcelImportBatch` entity and its repository were created and integrated into the service.

The batch stores:

| Field          | Purpose                                                    |
| -------------- | ---------------------------------------------------------- |
| `IMPORT_ID`    | Unique batch record ID                                     |
| `USER_ID`      | Admin who performed the import                             |
| `FILE_NAME`    | Uploaded filename                                          |
| `TOTAL_ROWS`   | Number of imported item rows                               |
| `TOTAL_ORDERS` | Number of unique Order Refs                                |
| `TOTAL_ITEMS`  | Number of imported item rows                               |
| `STATUS`       | Current result, presently `SUCCESS` for successful imports |
| `IMPORTED_AT`  | Import timestamp                                           |

### How the admin is recorded

The import controller obtains the authenticated principal through Spring Security's `Authentication` parameter and passes `authentication.getName()` to the service.

The service resolves that username through `SystemUsersRepository.findByUsername(username)`. The resulting `SystemUsers` entity is assigned to `batch.importedBy`.

The batch is saved after the order-creation loop. Because the operation is transactional, the order inserts and batch insert participate in the same transaction. If a transactional persistence failure propagates correctly, the transaction should roll back rather than commit a successful batch without its orders.

The current design records successful imports. It does not yet provide a separate, durable audit record for failed attempts.

## 7. Security and endpoints

The controller exposes two endpoints:

| Endpoint                                | Purpose                                  | Database behavior                           |
| --------------------------------------- | ---------------------------------------- | ------------------------------------------- |
| `POST /api/admin/excel-orders/validate` | Read and validate an uploaded Excel file | Does not insert orders or a batch           |
| `POST /api/admin/excel-orders/import`   | Validate and import the file             | Inserts orders/items and a successful batch |

Both endpoints are restricted to administrators using `@PreAuthorize("hasRole('ADMIN')")`. The security configuration also restricts `/api/admin/**` to users with the ADMIN role.

The project currently uses HTTP Basic authentication. Password confirmation before import has not been implemented yet.

## 8. Problems encountered and how they were handled

Problem 1 — Java method signature mismatch

Resolved

The controller called `importExcel(file, authentication.getName())`, but the service initially exposed `importExcel(MultipartFile file)` with only one argument. Java reported that the method was not applicable for two arguments.

Resolution: The service signature was updated to accept both `MultipartFile file` and `String username`. The controller passes the authenticated username.

Problem 2 — HTTP 401 Unauthorized

Validation endpoint subsequently worked

An HTTP 401 response appeared while testing the endpoint. This indicated an authentication failure or missing credentials, rather than an Excel validation error.

Resolution: The validation endpoint was subsequently tested successfully. The exact cause of the original 401 was not conclusively established, so it should not be recorded as a confirmed security-configuration fix.

Problem 3 — Potential NullPointerException in the order item list

Fix identified

The service adds each item using `order.getOrderItems().add(orderItem)`. If the collection is null in the `Orders` entity, this produces a `NullPointerException`.

Resolution: An initialization was recommended immediately after creating an order:

Java

```
Orders order = new Orders();
order.setOrderItems(new ArrayList<>());
```

The required `java.util.ArrayList` import must also be present. The collection should be initialized in the entity or before the first addition. The successful import results indicate that the tested path completed, but the exact location of the initialization should still be verified in the current source.

Problem 4 — Import batch dependencies and integration

Integrated

There was uncertainty about where to place the `ExcelImportBatch` creation code and whether the entity/repository needed changes.

Resolution: The batch is created after the order loop, not inside it. The entity, repository, imports, constructor injection, and repository field already exist. The batch is saved once per successful import operation.

Problem 5 — Same Excel file imported twice

Not yet resolved

The same file, `excel_order_import_test_full_rows.xlsx`, was imported twice. Each request created nine orders, 27 order items, and a successful audit batch.

Resolution so far: The SQL results confirmed that the two batches were recorded separately. The importer currently has no content-based duplicate protection. This is the next planned feature.

## 9. Testing performed and confirmed results

On 8 October 2026, the validation endpoint returned:

JSON

```
{
  "valid": true,
  "totalRows": 27,
  "validRows": 27,
  "errors": []
}
```

This confirms that the test file's 27 rows passed the validator with no reported errors.

The import was then tested against:

```
http://localhost:8080/api/admin/excel-orders/import
```

The SQL results confirmed two successful imports:

Database: MAHARASHTRIAN_THALI

| IMPORT_ID | TOTAL_ROWS | TOTAL_ORDERS | TOTAL_ITEMS | STATUS  |
| --------- | ---------- | ------------ | ----------- | ------- |
| 1         | 27         | 9            | 27          | SUCCESS |
| 2         | 27         | 9            | 27          | SUCCESS |

The database totals were:

| Table                | Total records after both imports    |
| -------------------- | ----------------------------------- |
| `ORDERS`             | 18                                  |
| `ORDER_ITEMS`        | 54                                  |
| `EXCEL_IMPORT_BATCH` | At least 2 successful batch records |

The totals are consistent with the file being imported twice: each import produced nine orders and 27 items. The audit table correctly reports the counts for each individual batch, rather than the cumulative database totals.

Current verified milestone: A 27-row file can pass validation and be imported, and the service records a successful import batch. Duplicate-import prevention remains outstanding.

## 10. Current implementation status

| Feature                                            | Status                                                     |
| -------------------------------------------------- | ---------------------------------------------------------- |
| Excel reading and row normalization                | Implemented                                                |
| Inheritance of order-level fields                  | Implemented                                                |
| Required-field and enum validation                 | Implemented                                                |
| Order-level consistency validation                 | Implemented                                                |
| Shop/user/group/item relationship validation       | Implemented                                                |
| Quantity and historical-price validation           | Implemented                                                |
| Grouping item rows by Order Ref                    | Implemented                                                |
| Creation of Orders and OrderItems                  | Successfully tested                                        |
| Internal UUID generation and source identification | Implemented                                                |
| Logged-in admin association                        | Integrated and reflected in batch record                   |
| Import batch audit                                 | Successfully tested                                        |
| Transactional import                               | Implemented; rollback behavior should be tested explicitly |
| Content-based duplicate-import protection          | Not implemented                                            |
| Password confirmation before import                | Not implemented                                            |
| Import token or preview-to-confirm protection      | Not implemented                                            |
| Database query optimization and batch processing   | Future work                                                |
| Failed-import audit history                        | Future work                                                |
| File upload size/type hardening                    | Future work                                                |

## 11. What we will implement next

The next steps should be completed in this order.

1. Duplicate-import protection using SHA-256

   Add a content hash to the import batch record, calculate the hash of the uploaded file, and check whether that exact file content has already been imported. Renaming the file must not bypass the check. Add a database uniqueness constraint and handle concurrent duplicate requests safely.

2. Password confirmation before importing

   Require the administrator to explicitly confirm the import using their current password. Verify the password securely; do not store it in plaintext or send it back to the frontend.

3. Secure preview-to-import flow

   Consider a short-lived, single-use confirmation token tied to the authenticated admin and validated file. Ensure the file being imported is the same file that was previewed and approved.

4. Test transaction rollback and error handling

   Simulate a database failure during import and verify that orders, order items, and the success batch all roll back together. Avoid exposing internal SQL errors or stack traces to the client.

5. Optimize for larger Excel files

   Reduce repeated database queries by resolving unique users, shops, groups, and menu items in batches or caching lookups for the duration of an import. Introduce batch processing and streaming only when justified by expected file sizes.

6. Strengthen upload and audit controls

   Enforce file-size and file-type limits, consider durable failed-import auditing, and provide an admin-facing import history view.

### Important design decisions to preserve

* Do not use the filename alone to detect duplicate files.

* Do not treat the Excel Order Ref as `DEVICE_ORDER_UUID`.

* Do not change the existing offline/device UUID architecture to implement import protection.

* Do not compare historical Excel prices against current menu prices.

* Do not insert any orders when validation reports errors.

* Keep master records such as System Users, Shops, Menu Groups, and Menu Items separate from imported historical transaction records.

## 12. Final summary

As of 9 October 2026, the Excel Order Import module has progressed from reading and validating spreadsheet data to successfully importing grouped orders, creating their order items, and recording the administrator and import statistics in `EXCEL_IMPORT_BATCH`.

The main issues encountered were a Java method-signature mismatch, an authentication error during testing, a potential null collection in the order entity, and accidental duplicate imports. The method signature and batch integration were addressed, validation and import were successfully demonstrated, and duplicate imports were confirmed through SQL.

Next task: implement SHA-256-based duplicate-import protection without changing the existing order UUID or source-device design.





after 10 october this is the progress
# Excel Order Import — Implementation & Testing Documentation

**Project:** Maharashtrian Thali — Restaurant Management System  
**Module:** Admin Excel Order Import  
**Documentation type:** Technical implementation and test report  
**Status:** Implemented; core tests passed, final invalid-import database verification pending

---

## 1. Objective

The Excel Order Import module allows an administrator to import restaurant orders and their items from an Excel workbook.

The implementation aims to:

- Validate the complete Excel file before saving data.
- Prevent importing the same file more than once.
- Handle simultaneous uploads safely.
- Preserve historical item prices.
- Maintain transactional consistency between orders, order items, and import audit records.
- Record successful imports for auditing.

## 2. Technology Stack

- Java 21
- Spring Boot 3.5.7
- Spring Data JPA and Hibernate 6.6
- MySQL 8.0
- Apache POI for Excel processing
- Spring Security with HTTP Basic authentication
- Java Security API for SHA-256 hashing
- Postman for API testing
- Python `requests` and `concurrent.futures` for concurrent-upload testing

## 3. Excel Template Structure

The import template contains ten columns:

| Column | Field | Purpose |
|---|---|---|
| 1 | System User | Existing system username |
| 2 | Shop | Shop associated with the order |
| 3 | Order Ref | Reference used to group order items |
| 4 | Order Date | Date of the order |
| 5 | Status | `PAID`, `ACTIVE`, or `CANCELLED` |
| 6 | Payment | `CASH` or `ONLINE` |
| 7 | Menu Group | Menu category |
| 8 | Menu Item | Item belonging to the selected shop and group |
| 9 | Qty | Quantity ordered |
| 10 | Price | Historical unit price |

### Row handling

Order-level fields can inherit their previous nonblank values when subsequent rows belong to the same order.

Item-level fields must be provided explicitly for each row.

Multiple rows with the same Order Ref are grouped into one order with multiple order items.

## 4. Architecture and Implementation

### 4.1 Excel reader

**Component:** `AdminExcelOrderReader`

Responsibilities:

- Read the uploaded Excel workbook.
- Extract and normalize row data.
- Apply the defined order-level inheritance rules.
- Produce normalized data for validation.

Excel date values must be interpreted correctly, including native Excel date serial values and the expected date format.

### 4.2 Validation service

**Component:** `AdminExcelOrderValidator`

The validator checks:

- Required fields.
- Valid order statuses and payment modes.
- Quantity greater than zero.
- Numeric, nonnegative prices.
- Existing users and shops.
- Valid menu group and menu item relationships.
- Consistency of order-level fields across rows belonging to the same order.

Validation errors include the row number, order reference, column, invalid value, and error description.

### 4.3 Import service

**Component:** `AdminExcelOrderImportService`

The service:

1. Reads and normalizes the Excel workbook.
2. Validates all rows.
3. Rejects the import if validation fails.
4. Calculates the SHA-256 hash of the uploaded file.
5. Checks whether that hash already exists.
6. Groups valid rows by Order Ref.
7. Creates orders and their associated items.
8. Preserves the Excel purchase price as the historical item price.
9. Saves a batch audit record after processing the orders.
10. Executes the import within a transaction.

The import method is annotated with `@Transactional`.

Each imported order receives a unique internal `DEVICE_ORDER_UUID`. The Excel Order Ref is used for grouping and is not reused as the internal UUID.

Imported orders use `SOURCE_DEVICE_ID = "EXCEL_IMPORT"`.

### 4.4 Controller endpoints

Both endpoints require administrator authorization and use multipart file uploads.

| HTTP method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/admin/excel-orders/validate` | Validate the uploaded Excel file without importing it |
| POST | `/api/admin/excel-orders/import` | Validate and import the workbook |

## 5. SHA-256 Duplicate-Import Protection

### 5.1 Database changes

Added the `FILE_HASH` column to `EXCEL_IMPORT_BATCH`:

```sql
ALTER TABLE EXCEL_IMPORT_BATCH
ADD COLUMN FILE_HASH VARCHAR(64) NULL;

CREATE UNIQUE INDEX UK_EXCEL_IMPORT_FILE_HASH
ON EXCEL_IMPORT_BATCH (FILE_HASH);
```

The column is nullable to accommodate legacy batch records. The unique index prevents duplicate non-null hashes.

### 5.2 Entity and repository

The `ExcelImportBatch` entity contains:

```java
@Column(name = "FILE_HASH", unique = true, length = 64)
private String fileHash;
```

The repository includes:

```java
boolean existsByFileHash(String fileHash);
```

### 5.3 Hash calculation

The service calculates a SHA-256 hash from the raw uploaded file bytes using Java's `MessageDigest` and `HexFormat`.

The resulting hexadecimal hash is 64 characters long.

### 5.4 Duplicate rejection

Before inserting orders, the service checks whether the file hash already exists. If it does, the service throws:

```java
throw new ResponseStatusException(
    HttpStatus.CONFLICT,
    "This Excel file has already been imported."
);
```

The unique database index provides a second layer of protection against simultaneous requests that both pass the preliminary existence check.

## 6. Global Exception Handling

**Component:** `GlobalExceptionHandler`

Implemented using `@RestControllerAdvice`.

The handler checks database integrity violations for the constraint name `UK_EXCEL_IMPORT_FILE_HASH`.

When the matching duplicate-hash violation is detected, it returns HTTP `409 Conflict` with a message indicating that the file has already been imported.

Other database integrity violations receive a generic HTTP `500 Internal Server Error` response.

This handler is intended to translate a duplicate-hash race-condition failure into a clean API response. Its behavior should be confirmed through the concurrent-upload test.

## 7. Test Results

### Test 1 — Successful Excel import

**Result: Passed**

A valid workbook was imported successfully.

The recorded test data included a workbook with 27 item rows grouped into 9 orders. The batch audit record stored the file name, hash, row count, order count, item count, status, and import timestamp.

### Test 2 — Sequential duplicate upload

**Result: Passed**

The same Excel file was uploaded again after a successful import.

The API returned HTTP `409 Conflict`:

```json
{
  "status": 409,
  "error": "Conflict",
  "message": "This Excel file has already been imported.",
  "path": "/api/admin/excel-orders/import"
}
```

The duplicate upload did not create another successful batch record.

Because the hash is based on file content, changing only the filename does not bypass duplicate detection. Changing the workbook's actual bytes produces a different hash and is treated as a different file unless its contents are otherwise rejected by business validation.

### Test 3 — Simultaneous duplicate uploads

**Result: Passed in the reported test**

A Python test script used two worker threads and a synchronization barrier to initiate two upload requests concurrently.

Test file: `Excel_Import_Race_Test.xlsx`

Order Ref: `TEST-ORDER-2026-RACE-001`

Reported responses:

- Request A: `409 Conflict`
- Request B: `200 OK`

The reported database audit showed one successful batch for the race-test workbook, containing one order and two item rows.

This is consistent with the expected behavior: one request succeeds while the competing duplicate request is rejected.

### Test 4 — Invalid quantity validation

**Result: Passed**

The test workbook contained two item rows, with quantity zero in the second row.

The validator returned:

```json
{
  "valid": false,
  "totalRows": 2,
  "validRows": 1,
  "errors": [
    {
      "rowNumber": 2,
      "orderRef": "TEST-ORDER-2026-RACE-001",
      "column": "Qty",
      "value": "0",
      "error": "Quantity must be greater than zero."
    }
  ]
}
```

This confirms that the validator identifies the invalid quantity and reports the row and column.

### Test 5 — Invalid import endpoint

**Result: Import rejected; final database verification pending**

The same invalid workbook was submitted to:

`POST /api/admin/excel-orders/import`

The endpoint returned the same validation result, with `valid: false` and the quantity error.

Before the invalid-import request, the following database counts were recorded:

| Table | Count before import |
|---|---:|
| `ORDERS` | 29 |
| `ORDER_ITEMS` | 85 |
| `EXCEL_IMPORT_BATCH` | 5 |

The counts were unchanged after the validation-only request. However, the counts have not yet been rechecked after the invalid request to the import endpoint.

Therefore, the import endpoint's rejection behavior is confirmed, but the final no-inserts verification for that specific import request remains pending.

## 8. Database Audit and Verification

The following queries are used to verify the database state:

```sql
SELECT COUNT(*) AS total_orders
FROM ORDERS;

SELECT COUNT(*) AS total_items
FROM ORDER_ITEMS;

SELECT COUNT(*) AS total_batches
FROM EXCEL_IMPORT_BATCH;
```

To inspect the batch audit records:

```sql
SELECT
    IMPORT_ID,
    FILE_NAME,
    FILE_HASH,
    TOTAL_ROWS,
    TOTAL_ORDERS,
    TOTAL_ITEMS,
    STATUS,
    IMPORTED_AT
FROM EXCEL_IMPORT_BATCH
ORDER BY IMPORT_ID DESC;
```

To inspect imported orders:

```sql
SELECT
    ORDER_ID,
    DEVICE_ORDER_UUID,
    TOTAL_AMOUNT,
    STATUS,
    MODE_OF_PAYMENT,
    SOURCE_DEVICE_ID
FROM ORDERS
WHERE SOURCE_DEVICE_ID = 'EXCEL_IMPORT'
ORDER BY ORDER_ID DESC;
```

## 9. Remaining Verification

Before marking this testing phase complete:

1. Re-run the three count queries after the invalid `/import` request.
2. Confirm that the counts remain at 29 orders, 85 order items, and 5 import batches.
3. If the counts are unchanged, record the invalid-import no-inserts test as passed.

## 10. Conclusion

The Excel import module now includes content-based duplicate detection, a unique database constraint, concurrent-upload protection, structured row-level validation, and batch audit tracking.

The reported sequential duplicate and concurrent duplicate tests produced the expected results. The invalid workbook was rejected by both the validation and import endpoints.

The only outstanding verification in this report is confirming that the database counts remain unchanged after the invalid import request.
