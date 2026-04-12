const KEYWORD_MAP = [
  {
    categoryId: "emi",
    keywords: ["emi", "loan", "mortgage", "home loan", "car loan"],
  },
  {
    categoryId: "maid",
    keywords: ["maid", "bai", "cleaning lady", "domestic help", "helper"],
  },
  {
    categoryId: "electricity",
    keywords: ["electricity", "bijli", "power bill", "electric bill", "bescom", "tpddl", "msedcl"],
  },
  {
    categoryId: "internet",
    keywords: ["internet", "wifi", "broadband", "jio fiber", "airtel fiber", "act", "hathway"],
  },
  {
    categoryId: "phone",
    keywords: ["phone recharge", "mobile recharge", "recharge", "sim", "jio", "airtel prepaid", "vi recharge"],
  },
  {
    categoryId: "cylinder",
    keywords: ["cylinder", "gas cylinder", "lpg", "indane", "hp gas", "bharat gas"],
  },
  {
    categoryId: "carservice",
    keywords: ["car service", "car wash", "car repair", "mechanic", "puncture", "tyre", "petrol", "fuel"],
  },
  {
    categoryId: "milk",
    keywords: ["milk", "doodh", "dairy", "amul", "mother dairy", "curd", "paneer", "lassi"],
  },
  {
    categoryId: "fruitsAndVeg",
    keywords: ["fruits", "vegetables", "veg", "sabzi", "lemon", "corn", "broccoli", "tomato", "potato", "onion", "mango", "banana"],
  },
  {
    categoryId: "rashan",
    keywords: ["rashan", "ration", "ghar kharch", "karyana", "atta", "flour", "rice", "dal", "egg", "eggs", "oil", "sugar", "salt", "stevia", "grocery", "groceries"],
  },
  {
    categoryId: "diaper",
    keywords: ["diaper", "nappy", "pampers", "huggies", "wipes", "baby"],
  },
  {
    categoryId: "misc",
    keywords: ["misc", "miscellaneous", "other", "random"],
  },
];

/**
 * Returns a categoryId if the description matches a keyword rule, else null.
 * @param {string} description
 * @returns {string|null}
 */
export function autoCategorize(description) {
  const lower = description.toLowerCase();
  for (const rule of KEYWORD_MAP) {
    for (const kw of rule.keywords) {
      if (lower.includes(kw)) return rule.categoryId;
    }
  }
  return null;
}
