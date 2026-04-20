import yup from "@/lib/yup";
import { isAddress } from "viem";

/** RHF often yields strings from number inputs; coerce so yup.number() validates correctly. */
function optionalCweThAmount(schema: yup.NumberSchema<number | undefined>) {
  return schema.transform((_, orig) => {
    if (orig == null || orig === undefined) return undefined;
    if (typeof orig === "string" && orig.trim() === "") return undefined;
    const n = typeof orig === "number" ? orig : Number(String(orig).trim());
    return Number.isFinite(n) ? n : undefined;
  });
}

export const createPresaleSchema = yup.object().shape({
  tokenAddress: yup
    .string()
    .required("Token contract address is required")
    .test("is-valid-address", "Invalid token address", (value) => {
      return isAddress(value);
    }),
  tokenName: yup.string().required("Token name is required"),
  tokenSymbol: yup.string().required("Token symbol is required"),
  presaleRate: yup
    .number()
    .typeError("Presale rate must be a number")
    .label("Presale rate")
    .required("Presale rate is required")
    .positive("Presale rate must be positive"),
  softCap: yup
    .number()
    .label("Soft cap")
    .typeError("Soft cap must be a number")
    .required("Soft cap is required")
    .positive("Soft cap must be positive"),
  hardCap: yup
    .number()
    .label("Hard cap")
    .typeError("Hard cap must be a number")
    .required("Hard cap is required")
    .positive("Hard cap must be positive")
    .moreThan(yup.ref("softCap"), "Hard cap must be greater than soft cap"),
  minContribution: optionalCweThAmount(
    yup
      .number()
      .typeError("Minimum contribution must be a number")
      .label("Minimum contribution")
      .optional()
      .min(0, "Minimum cannot be negative"),
  )
    .test("lte-hardCap", "Cannot exceed hard cap", function (v) {
      if (v == null || v === undefined) return true;
      const cap = this.parent.hardCap;
      if (cap == null || cap === undefined) return true;
      return v <= cap;
    }),
  maxContribution: optionalCweThAmount(
    yup
      .number()
      .typeError("Maximum contribution must be a number")
      .label("Maximum contribution")
      .optional(),
  )
    .test("positive-if-set", "Leave blank for no per-wallet cap, or enter a positive amount", (v) => {
      if (v == null || v === undefined || Number.isNaN(v)) return true;
      return v > 0;
    })
    .test("gte-min", "Max must be greater than or equal to min", function (v) {
      if (v == null || v === undefined) return true;
      const min = this.parent.minContribution;
      if (min == null || min === undefined) return true;
      return v >= min;
    })
    .test("lte-hardCap", "Cannot exceed hard cap", function (v) {
      if (v == null || v === undefined) return true;
      const cap = this.parent.hardCap;
      if (cap == null || cap === undefined) return true;
      return v <= cap;
    }),
  liquidityPercent: yup
    .number()
    .typeError("Liquidity percentage must be a number")
    .label("Liquidity percentage")
    .required("Liquidity percentage is required")
    .min(50, "Liquidity percentage must be at least 50")
    .max(100, "Liquidity percentage cannot exceed 100"),
  // liquidityLockup: yup
  //   .number()
  //   .typeError("Liquidity lockup time must be a number")
  //   .label("Liquidity lockup time")
  //   .required("Liquidity lockup time is required")
  //   .positive("Liquidity lockup time must be positive")
  //   .integer("Liquidity lockup time must be an integer"),
  listingRate: yup
    .number()
    .typeError("Listing rate must be a number")
    .label("Listing rate")
    .required("Listing rate is required")
    .positive("Listing rate must be positive"),
  startDate: yup.date().required("Start date is required"),
  endDate: yup.date().required("End date is required").min(yup.ref("startDate"), "End date must be after start date"),
  website: yup.string().optional(),
  telegram: yup.string().optional(),
  twitter: yup.string().optional(),
  thumbnail: yup.string().optional(),
});

export type FormData = yup.InferType<typeof createPresaleSchema>;
