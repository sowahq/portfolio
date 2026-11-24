import { describe, expect, it } from "vitest";
import { stackTechnologies } from "../stack.js";
import { PERSON_DESCRIPTION, personJsonLd } from "./person.js";

describe("personJsonLd", () => {
  const person = personJsonLd();

  const cases: { field: string; expected: unknown }[] = [
    { field: "@type", expected: "Person" },
    { field: "@id", expected: "https://mth.lc/#person" },
    { field: "name", expected: "Mathis Lutic" },
    { field: "url", expected: "https://mth.lc/" },
    { field: "email", expected: "contact@mth.lc" },
    { field: "jobTitle", expected: "Développeur full-stack freelance" },
    { field: "description", expected: PERSON_DESCRIPTION },
    { field: "image", expected: "https://mth.lc/og.png" },
    { field: "address", expected: { "@type": "PostalAddress", addressLocality: "Lille", addressCountry: "FR" } },
    { field: "knowsLanguage", expected: ["fr", "en"] },
    { field: "sameAs", expected: ["https://github.com/sowahq", "https://www.linkedin.com/in/mathis-lutic"] },
    { field: "knowsAbout", expected: [...stackTechnologies(), "Reverse engineering", "Sécurité logicielle"] },
    { field: "telephone", expected: undefined },
  ];

  for (const { field, expected } of cases) {
    it(field, () => {
      expect(person[field]).toEqual(expected);
    });
  }

  it("never links the blog as another identity", () => {
    expect(person.sameAs).not.toContain("https://blog.mth.lc");
  });
});
