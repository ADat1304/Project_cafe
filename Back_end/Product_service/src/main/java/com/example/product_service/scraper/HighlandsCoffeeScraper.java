package com.example.product_service.scraper;

import lombok.extern.slf4j.Slf4j;
import org.jsoup.Connection;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Component
public class HighlandsCoffeeScraper {

    private static final String TARGET_URL = "https://www.highlandscoffee.com.vn/vn/ca-phe.html";
    private static final Pattern DIGIT_PATTERN = Pattern.compile("[0-9]+([.,][0-9]{3})*");

    public List<HighlandsProduct> scrapeMenu() throws IOException {
        Document document = connect();
        Elements productCards = locateProductCards(document);
        List<HighlandsProduct> products = new ArrayList<>();
        for (Element card : productCards) {
            String productName = extractProductName(card);
            if (productName.isBlank()) {
                continue;
            }
            String categoryName = resolveCategoryName(card).orElse("Cà phê");
            BigDecimal price = extractPrice(card);
            String imageUrl = extractImage(card);
            products.add(new HighlandsProduct(categoryName, productName, price, imageUrl));
        }
        return products;
    }

    private Document connect() throws IOException {
        Connection.Response response = Jsoup.connect(TARGET_URL)
                .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36")
                .referrer("https://www.google.com/")
                .header("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8")
                .header("accept-language", "vi,en-US;q=0.9,en;q=0.8")
                .header("cache-control", "no-cache")
                .header("pragma", "no-cache")
                .ignoreContentType(true)
                .ignoreHttpErrors(true)
                .timeout(20000)
                .followRedirects(true)
                .execute();

        if (response.statusCode() >= 400) {
            throw new IOException("Failed to fetch Highlands Coffee menu, status " + response.statusCode());
        }

        return response.parse();
    }

    private Elements locateProductCards(Document document) {
        Elements cards = document.select(
                ".product-item, li.product-item, .product-item-list .item, .product-list .item, " +
                        ".product, .product-card, .product-block, [data-product-id]");

        if (!cards.isEmpty()) {
            return cards;
        }

        Elements legacyCards = document.select(".item-product, .product-menu-item, .menu-item");
        if (!legacyCards.isEmpty()) {
            return legacyCards;
        }

        return document.select("article, .item");
    }

    private Optional<String> resolveCategoryName(Element card) {
        for (Element ancestor : card.parents()) {
            Element heading = selectDirectHeading(ancestor);
            if (heading != null && !heading.text().isBlank()) {
                return Optional.of(heading.text().trim());
            }

            Element previousHeading = ancestor.previousElementSibling();
            while (previousHeading != null) {
                Element siblingHeading = selectDirectHeading(previousHeading);
                if (siblingHeading != null && !siblingHeading.text().isBlank()) {
                    return Optional.of(siblingHeading.text().trim());
                }
                previousHeading = previousHeading.previousElementSibling();
            }
        }
        return Optional.empty();
    }

    private Element selectDirectHeading(Element element) {
        return element.selectFirst("> h2, > h3, > .title, > .heading");
    }

    private String extractProductName(Element card) {
        Element title = card.selectFirst(".product-name, .title, h3, h4, a[title]");
        if (title != null && !title.text().isBlank()) {
            return title.text().trim();
        }
        return card.text().trim();
    }

    private BigDecimal extractPrice(Element card) {
        Element priceElement = card.selectFirst(".price, .product-price, .prize, .gia, [itemprop=price], [data-price], [data-price-vnd]");
        String priceText = "";

        if (priceElement != null) {
            if (priceElement.hasAttr("content")) {
                priceText = priceElement.attr("content");
            } else if (priceElement.hasAttr("data-price")) {
                priceText = priceElement.attr("data-price");
            } else if (priceElement.hasAttr("data-price-vnd")) {
                priceText = priceElement.attr("data-price-vnd");
            } else {
                priceText = priceElement.text();
            }
        }

        if (priceText.isBlank()) {
            priceText = card.attr("data-price");
        }

        if (priceText.isBlank()) {
            return BigDecimal.ZERO;
        }

        Matcher matcher = DIGIT_PATTERN.matcher(priceText.replace("\u00a0", " "));
        if (!matcher.find()) {
            return BigDecimal.ZERO;
        }
        String numeric = matcher.group().replace(".", "").replace(",", "");
        try {
            return new BigDecimal(numeric);
        } catch (NumberFormatException ex) {
            log.warn("Cannot parse price from text: {}", priceText);
            return BigDecimal.ZERO;
        }
    }

    private String extractImage(Element card) {
        Element image = card.selectFirst("img, picture source");
        if (image == null) {
            return "";
        }
        String imageUrl = image.hasAttr("data-src") ? image.absUrl("data-src")
                : image.hasAttr("data-lazy") ? image.absUrl("data-lazy")
                : image.hasAttr("srcset") ? image.absUrl("srcset")
                : image.absUrl("src");
        return imageUrl == null ? "" : imageUrl;
    }
}