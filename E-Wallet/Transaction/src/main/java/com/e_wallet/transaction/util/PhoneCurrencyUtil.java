package com.e_wallet.transaction.util;

import java.util.*;

public class PhoneCurrencyUtil {

    private static final Map<String, String> codeToCurrency = new HashMap<>();

    static {
        codeToCurrency.put("+1", "USD");
        codeToCurrency.put("+91", "INR");
        codeToCurrency.put("+44", "GBP");
        codeToCurrency.put("+81", "JPY");
        codeToCurrency.put("+61", "AUD");
        codeToCurrency.put("+86", "CNY");
        codeToCurrency.put("+49", "EUR");
        codeToCurrency.put("+33", "EUR");
        codeToCurrency.put("+7", "RUB");
        codeToCurrency.put("+39", "EUR");
        codeToCurrency.put("+55", "BRL");
        codeToCurrency.put("+34", "EUR");
        codeToCurrency.put("+27", "ZAR");
        codeToCurrency.put("+82", "KRW");
        codeToCurrency.put("+90", "TRY");
        codeToCurrency.put("+31", "EUR");
        codeToCurrency.put("+351", "EUR");
        codeToCurrency.put("+46", "SEK");
        codeToCurrency.put("+47", "NOK");
        codeToCurrency.put("+41", "CHF");
        codeToCurrency.put("+64", "NZD");
        codeToCurrency.put("+65", "SGD");
        codeToCurrency.put("+66", "THB");
        codeToCurrency.put("+62", "IDR");
        codeToCurrency.put("+60", "MYR");
        codeToCurrency.put("+63", "PHP");
        codeToCurrency.put("+92", "PKR");
        codeToCurrency.put("+880", "BDT");
        codeToCurrency.put("+94", "LKR");
        codeToCurrency.put("+20", "EGP");
        codeToCurrency.put("+234", "NGN");
        codeToCurrency.put("+254", "KES");
        codeToCurrency.put("+256", "UGX");
        codeToCurrency.put("+255", "TZS");
        codeToCurrency.put("+212", "MAD");
        codeToCurrency.put("+213", "DZD");
        codeToCurrency.put("+216", "TND");
        codeToCurrency.put("+218", "LYD");
        codeToCurrency.put("+971", "AED");
        codeToCurrency.put("+966", "SAR");
        codeToCurrency.put("+968", "OMR");
        codeToCurrency.put("+974", "QAR");
        codeToCurrency.put("+973", "BHD");
        codeToCurrency.put("+965", "KWD");
        codeToCurrency.put("+972", "ILS");
        codeToCurrency.put("+98", "IRR");
        codeToCurrency.put("+964", "IQD");
        codeToCurrency.put("+961", "LBP");
        codeToCurrency.put("+962", "JOD");
        codeToCurrency.put("+963", "SYP");
        codeToCurrency.put("+960", "MVR");
        codeToCurrency.put("+977", "NPR");
        codeToCurrency.put("+95", "MMK");
        codeToCurrency.put("+856", "LAK");
        codeToCurrency.put("+855", "KHR");
        codeToCurrency.put("+84", "VND");
        codeToCurrency.put("+886", "TWD");
        codeToCurrency.put("+992", "TJS");
        codeToCurrency.put("+993", "TMT");
        codeToCurrency.put("+994", "AZN");
        codeToCurrency.put("+995", "GEL");
        codeToCurrency.put("+996", "KGS");
        codeToCurrency.put("+998", "UZS");
        codeToCurrency.put("+380", "UAH");
        codeToCurrency.put("+375", "BYN");
        codeToCurrency.put("+420", "CZK");
        codeToCurrency.put("+421", "EUR");
        codeToCurrency.put("+36", "HUF");
        codeToCurrency.put("+40", "RON");
        codeToCurrency.put("+381", "RSD");
        codeToCurrency.put("+385", "HRK");
        codeToCurrency.put("+386", "EUR");
        codeToCurrency.put("+387", "BAM");
        codeToCurrency.put("+389", "MKD");
        codeToCurrency.put("+43", "EUR");
        codeToCurrency.put("+45", "DKK");
        codeToCurrency.put("+48", "PLN");
        codeToCurrency.put("+358", "EUR");
        codeToCurrency.put("+30", "EUR");
        codeToCurrency.put("+353", "EUR");
        codeToCurrency.put("+354", "ISK");
        codeToCurrency.put("+357", "EUR");
        codeToCurrency.put("+359", "BGN");
        codeToCurrency.put("+373", "MDL");
    }

    public static String getCurrency(String phoneNumber) {
        return codeToCurrency.entrySet().stream()
                .sorted((a, b) -> Integer.compare(b.getKey().length(), a.getKey().length()))
                .filter(e -> phoneNumber.startsWith(e.getKey()))
                .map(Map.Entry::getValue)
                .findFirst()
                .orElse("UNKNOWN");
    }
} 
