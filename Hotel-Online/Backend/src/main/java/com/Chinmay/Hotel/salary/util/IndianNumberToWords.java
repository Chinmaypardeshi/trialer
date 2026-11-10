package com.Chinmay.Hotel.salary.util;

import java.math.BigDecimal;

public class IndianNumberToWords {

    private static final String[] UNITS = {
            "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
            "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
            "Seventeen", "Eighteen", "Nineteen"
    };

    private static final String[] TENS = {
            "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
    };

    public static String convertToIndianCurrencyWords(BigDecimal amount) {
        if (amount == null) {
            return "";
        }

        long rupees = amount.longValue();
        int paise = amount.remainder(BigDecimal.ONE).multiply(new BigDecimal(100)).intValue();

        if (rupees == 0 && paise == 0) {
            return "Zero Rupees Only";
        }

        StringBuilder result = new StringBuilder();

        if (rupees > 0) {
            result.append(convertNumberToWords(rupees)).append(" Rupees");
        }

        if (paise > 0) {
            if (rupees > 0) {
                result.append(" and ");
            }
            result.append(convertLessThanOneThousand(paise)).append(" Paise");
        }

        result.append(" Only");
        return result.toString().trim();
    }

    private static String convertNumberToWords(long n) {
        if (n == 0) {
            return "Zero";
        }

        StringBuilder words = new StringBuilder();

        long crores = n / 10000000;
        long remainder = n % 10000000;

        if (crores > 0) {
            words.append(convertNumberToWords(crores)).append(" Crore ");
        }

        long lakhs = remainder / 100000;
        remainder = remainder % 100000;

        if (lakhs > 0) {
            words.append(convertLessThanOneThousand(lakhs)).append(" Lakh ");
        }

        long thousands = remainder / 1000;
        remainder = remainder % 1000;

        if (thousands > 0) {
            words.append(convertLessThanOneThousand(thousands)).append(" Thousand ");
        }

        if (remainder > 0) {
            words.append(convertLessThanOneThousand(remainder)).append(" ");
        }

        return words.toString().replaceAll("\\s+", " ").trim();
    }

    private static String convertLessThanOneThousand(long n) {
        StringBuilder current = new StringBuilder();

        if (n >= 100) {
            current.append(UNITS[(int) (n / 100)]).append(" Hundred ");
            n %= 100;
        }

        if (n >= 20) {
            current.append(TENS[(int) (n / 10)]).append(" ");
            n %= 10;
        }

        if (n > 0) {
            current.append(UNITS[(int) n]).append(" ");
        }

        return current.toString().trim();
    }
}
