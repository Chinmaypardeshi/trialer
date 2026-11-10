package com.Chinmay.Hotel.salary.service.impl;

import com.Chinmay.Hotel.salary.dto.SalaryCertificateRequestDTO;
import com.Chinmay.Hotel.salary.dto.SalaryComponentDTO;
import com.Chinmay.Hotel.salary.service.AdminSalaryCertificateService;
import com.Chinmay.Hotel.salary.util.IndianNumberToWords;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.openpdf.text.*;
import org.openpdf.text.pdf.*;
import org.openpdf.text.pdf.draw.LineSeparator;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.InputStream;
import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminSalaryCertificateServiceImpl implements AdminSalaryCertificateService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd - MM - yyyy");
    private static final DecimalFormat AMOUNT_FORMAT = new DecimalFormat("#,##,##0.00");
    private static final DecimalFormat WHOLE_AMOUNT_FORMAT = new DecimalFormat("#,##,##0");

    @Override
    public String getSalaryInWords(BigDecimal amount) {
        return IndianNumberToWords.convertToIndianCurrencyWords(amount);
    }

    @Override
    public ByteArrayInputStream generateSalaryCertificatePdf(SalaryCertificateRequestDTO request) {
        Document document = new Document(PageSize.A4, 45, 45, 45, 45);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // Font setup with Unicode fallback for Indian Rupee symbol
            FontHolder fonts = createFonts();

            // 1. Restaurant Header (Logo + Details)
            addHeader(document, fonts);

            // Divider line below header
            LineSeparator separator = new LineSeparator(1f, 100f, new Color(203, 213, 225), Element.ALIGN_CENTER, -6f);
            document.add(separator);

            // Spacing
            document.add(new Paragraph(" ", fonts.small));

            // 2. Document Title: SALARY CERTIFICATE
            Paragraph title = new Paragraph("SALARY CERTIFICATE", fonts.title);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingBefore(12f);
            title.setSpacingAfter(18f);
            document.add(title);

            // 3. Issue Date: Date: dd - MM - yyyy
            String formattedDate = request.getIssueDate() != null
                    ? request.getIssueDate().format(DATE_FORMATTER)
                    : "";
            Paragraph datePara = new Paragraph("Date: " + formattedDate, fonts.regular);
            datePara.setAlignment(Element.ALIGN_LEFT);
            datePara.setSpacingAfter(14f);
            document.add(datePara);

            // 4. Heading: TO WHOMSOEVER IT MAY CONCERN
            Paragraph toWhom = new Paragraph("TO WHOMSOEVER IT MAY CONCERN", fonts.subheading);
            toWhom.setAlignment(Element.ALIGN_LEFT);
            toWhom.setSpacingAfter(14f);
            document.add(toWhom);

            // 5. Certification Body 1
            Paragraph body1 = new Paragraph();
            body1.setLeading(20f);
            body1.setAlignment(Element.ALIGN_JUSTIFIED);
            body1.add(new Chunk("This is to certify that ", fonts.regular));
            body1.add(new Chunk(request.getEmployeeName() != null ? request.getEmployeeName().trim() : "", fonts.bold));
            body1.add(new Chunk(", is employed with ", fonts.regular));
            body1.add(new Chunk("Siddhu’s Maharashtrian Thali", fonts.bold));
            body1.add(new Chunk(". The employee has been working with our organization since ", fonts.regular));
            body1.add(new Chunk(request.getJoiningDateOrYear() != null ? request.getJoiningDateOrYear().trim() : "", fonts.bold));
            body1.add(new Chunk(".", fonts.regular));
            body1.setSpacingAfter(14f);
            document.add(body1);

            // 6. Certification Body 2 (Gross Monthly Salary)
            String formattedAmount = formatAmount(request.getMonthlyGrossSalary());
            String salaryInWords = getSalaryInWords(request.getMonthlyGrossSalary());

            Paragraph body2 = new Paragraph();
            body2.setLeading(20f);
            body2.setAlignment(Element.ALIGN_JUSTIFIED);
            body2.add(new Chunk("The employee is currently drawing a Gross Monthly Salary of ", fonts.regular));
            body2.add(new Chunk(fonts.currencySymbol + formattedAmount, fonts.bold));
            body2.add(new Chunk(" (" + salaryInWords + ").", fonts.regular));
            body2.setSpacingAfter(18f);
            document.add(body2);

            // 7. Salary Breakdown Section
            Paragraph breakdownTitle = new Paragraph("Salary Breakdown", fonts.bold);
            breakdownTitle.setSpacingAfter(8f);
            document.add(breakdownTitle);

            addSalaryBreakdownTable(document, request, fonts);

            // 8. Purpose Statement Body 3
            String purpose = (request.getPurpose() != null && !request.getPurpose().isBlank())
                    ? request.getPurpose().trim()
                    : "official purposes";

            Paragraph body3 = new Paragraph();
            body3.setLeading(19f);
            body3.setAlignment(Element.ALIGN_JUSTIFIED);
            body3.setSpacingBefore(16f);
            body3.add(new Chunk("This certificate has been issued at the request of the employee for ", fonts.regular));
            body3.add(new Chunk(purpose, fonts.regular));
            body3.add(new Chunk(". It is based on the records maintained by the restaurant and is valid as of the date of issue.", fonts.regular));
            body3.setSpacingAfter(48f);
            document.add(body3);

            // 9. Signature Block (Right Aligned)
            addSignatureBlock(document, fonts);

            document.close();
        } catch (DocumentException e) {
            log.error("PDF generation failed", e);
            throw new RuntimeException("PDF generation failed: " + e.getMessage(), e);
        }

        return new ByteArrayInputStream(out.toByteArray());
    }

    private void addHeader(Document document, FontHolder fonts) throws DocumentException {
        PdfPTable headerTable = new PdfPTable(new float[]{1.3f, 4.2f});
        headerTable.setWidthPercentage(100f);
        headerTable.setSpacingAfter(8f);

        // Left Cell: Logo
        PdfPCell logoCell = new PdfPCell();
        logoCell.setBorder(Rectangle.NO_BORDER);
        logoCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        logoCell.setHorizontalAlignment(Element.ALIGN_LEFT);

        try {
            ClassPathResource logoResource = new ClassPathResource("static/images/logo.png");
            if (logoResource.exists()) {
                try (InputStream is = logoResource.getInputStream()) {
                    byte[] imageBytes = is.readAllBytes();
                    Image logo = Image.getInstance(imageBytes);
                    logo.scaleToFit(80f, 80f);
                    logoCell.addElement(logo);
                }
            } else {
                logoCell.addElement(new Paragraph(""));
            }
        } catch (Exception ex) {
            log.warn("Could not load logo from static/images/logo.png: {}", ex.getMessage());
            logoCell.addElement(new Paragraph(""));
        }
        headerTable.addCell(logoCell);

        // Right Cell: Restaurant Details
        PdfPCell textCell = new PdfPCell();
        textCell.setBorder(Rectangle.NO_BORDER);
        textCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        textCell.setPaddingLeft(10f);

        Paragraph name = new Paragraph("Siddhu’s Maharashtrian Thali", fonts.restaurantName);
        name.setSpacingAfter(3f);
        textCell.addElement(name);

        Paragraph address = new Paragraph(
                "Sr. No. 503, Rasta Peth, In front of Khurana Mobile Shopee, Near Apollo Theatre, Pune, Maharashtra 411011",
                fonts.address
        );
        address.setLeading(14f);
        address.setSpacingAfter(3f);
        textCell.addElement(address);

        Paragraph phone = new Paragraph("Phone: 8600155129", fonts.addressBold);
        textCell.addElement(phone);

        headerTable.addCell(textCell);

        document.add(headerTable);
    }

    private void addSalaryBreakdownTable(Document document, SalaryCertificateRequestDTO request, FontHolder fonts)
            throws DocumentException {
        PdfPTable table = new PdfPTable(new float[]{3.2f, 1.8f});
        table.setWidthPercentage(75f);
        table.setHorizontalAlignment(Element.ALIGN_LEFT);

        Color headerBg = new Color(241, 245, 249);
        Color borderColor = new Color(203, 213, 225);

        // Table Header
        PdfPCell h1 = new PdfPCell(new Phrase("Component", fonts.tableHeader));
        h1.setBackgroundColor(headerBg);
        h1.setBorderColor(borderColor);
        h1.setPadding(6f);
        h1.setVerticalAlignment(Element.ALIGN_MIDDLE);
        table.addCell(h1);

        PdfPCell h2 = new PdfPCell(new Phrase("Amount (" + fonts.currencySymbol + ")", fonts.tableHeader));
        h2.setBackgroundColor(headerBg);
        h2.setBorderColor(borderColor);
        h2.setHorizontalAlignment(Element.ALIGN_RIGHT);
        h2.setVerticalAlignment(Element.ALIGN_MIDDLE);
        h2.setPadding(6f);
        table.addCell(h2);

        List<SalaryComponentDTO> components = request.getComponents();
        if (components == null || components.isEmpty()) {
            // Default: Basic Salary equal to gross salary
            PdfPCell c1 = new PdfPCell(new Phrase("Basic Salary", fonts.regular));
            c1.setBorderColor(borderColor);
            c1.setPadding(6f);
            table.addCell(c1);

            PdfPCell c2 = new PdfPCell(new Phrase(formatAmount(request.getMonthlyGrossSalary()), fonts.regular));
            c2.setBorderColor(borderColor);
            c2.setHorizontalAlignment(Element.ALIGN_RIGHT);
            c2.setPadding(6f);
            table.addCell(c2);
        } else {
            for (SalaryComponentDTO comp : components) {
                if (comp.getName() == null || comp.getName().isBlank()) {
                    continue;
                }
                PdfPCell c1 = new PdfPCell(new Phrase(comp.getName().trim(), fonts.regular));
                c1.setBorderColor(borderColor);
                c1.setPadding(6f);
                table.addCell(c1);

                PdfPCell c2 = new PdfPCell(new Phrase(formatAmount(comp.getAmount()), fonts.regular));
                c2.setBorderColor(borderColor);
                c2.setHorizontalAlignment(Element.ALIGN_RIGHT);
                c2.setPadding(6f);
                table.addCell(c2);
            }
        }

        document.add(table);
    }

    private void addSignatureBlock(Document document, FontHolder fonts) throws DocumentException {
        PdfPTable sigTable = new PdfPTable(1);
        sigTable.setWidthPercentage(40f);
        sigTable.setHorizontalAlignment(Element.ALIGN_RIGHT);

        PdfPCell sigCell = new PdfPCell();
        sigCell.setBorder(Rectangle.NO_BORDER);
        sigCell.setHorizontalAlignment(Element.ALIGN_RIGHT);

        // Gap for physical signature / seal
        Paragraph blankLines = new Paragraph("\n\n\n", fonts.regular);
        sigCell.addElement(blankLines);

        Paragraph prop = new Paragraph("Proprietor", fonts.bold);
        prop.setAlignment(Element.ALIGN_RIGHT);
        sigCell.addElement(prop);

        Paragraph restName = new Paragraph("Siddhu’s Maharashtrian Thali", fonts.small);
        restName.setAlignment(Element.ALIGN_RIGHT);
        sigCell.addElement(restName);

        sigTable.addCell(sigCell);
        document.add(sigTable);
    }

    private String formatAmount(BigDecimal amount) {
        if (amount == null) {
            return "0";
        }
        if (amount.remainder(BigDecimal.ONE).compareTo(BigDecimal.ZERO) == 0) {
            return WHOLE_AMOUNT_FORMAT.format(amount);
        }
        return AMOUNT_FORMAT.format(amount);
    }

    private FontHolder createFonts() {
        // Try to load a system TrueType font (e.g. Arial or Calibri) which has Indian Rupee glyph (₹)
        String[] candidateFontPaths = {
                "C:/Windows/Fonts/arial.ttf",
                "C:/Windows/Fonts/calibri.ttf",
                "C:/Windows/Fonts/segoeui.ttf",
                "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
                "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"
        };

        String[] candidateBoldPaths = {
                "C:/Windows/Fonts/arialbd.ttf",
                "C:/Windows/Fonts/calibrib.ttf",
                "C:/Windows/Fonts/segoeuib.ttf",
                "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
                "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
        };

        BaseFont regularBf = null;
        BaseFont boldBf = null;

        for (int i = 0; i < candidateFontPaths.length; i++) {
            File regFile = new File(candidateFontPaths[i]);
            if (regFile.exists()) {
                try {
                    regularBf = BaseFont.createFont(candidateFontPaths[i], BaseFont.IDENTITY_H, BaseFont.EMBEDDED);
                    File boldFile = new File(candidateBoldPaths[i]);
                    if (boldFile.exists()) {
                        boldBf = BaseFont.createFont(candidateBoldPaths[i], BaseFont.IDENTITY_H, BaseFont.EMBEDDED);
                    } else {
                        boldBf = regularBf;
                    }
                    log.info("Using TrueType font for PDF: {}", candidateFontPaths[i]);
                    break;
                } catch (Exception e) {
                    log.warn("Failed to load font {}: {}", candidateFontPaths[i], e.getMessage());
                }
            }
        }

        if (regularBf != null && boldBf != null) {
            return new FontHolder(
                    "₹",
                    new Font(boldBf, 16, Font.BOLD, new Color(15, 23, 42)),
                    new Font(boldBf, 15, Font.BOLD, new Color(15, 23, 42)),
                    new Font(boldBf, 11, Font.BOLD, new Color(15, 23, 42)),
                    new Font(regularBf, 11, Font.NORMAL, new Color(51, 65, 85)),
                    new Font(boldBf, 11, Font.BOLD, new Color(15, 23, 42)),
                    new Font(regularBf, 9.5f, Font.NORMAL, new Color(71, 85, 105)),
                    new Font(boldBf, 9.5f, Font.BOLD, new Color(15, 23, 42)),
                    new Font(regularBf, 8.5f, Font.NORMAL, new Color(100, 116, 139)),
                    new Font(boldBf, 10.5f, Font.BOLD, new Color(30, 41, 59))
            );
        }

        // Fallback to standard Helvetica if TrueType font unavailable
        return new FontHolder(
                "Rs. ",
                FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, Font.BOLD, new Color(15, 23, 42)),
                FontFactory.getFont(FontFactory.HELVETICA_BOLD, 15, Font.BOLD, new Color(15, 23, 42)),
                FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, Font.BOLD, new Color(15, 23, 42)),
                FontFactory.getFont(FontFactory.HELVETICA, 11, Font.NORMAL, new Color(51, 65, 85)),
                FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, Font.BOLD, new Color(15, 23, 42)),
                FontFactory.getFont(FontFactory.HELVETICA, 9.5f, Font.NORMAL, new Color(71, 85, 105)),
                FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9.5f, Font.BOLD, new Color(15, 23, 42)),
                FontFactory.getFont(FontFactory.HELVETICA, 8.5f, Font.NORMAL, new Color(100, 116, 139)),
                FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10.5f, Font.BOLD, new Color(30, 41, 59))
        );
    }

    private record FontHolder(
            String currencySymbol,
            Font restaurantName,
            Font title,
            Font subheading,
            Font regular,
            Font bold,
            Font address,
            Font addressBold,
            Font small,
            Font tableHeader
    ) {}
}
