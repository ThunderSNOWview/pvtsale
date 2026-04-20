import * as yup from "yup";

yup.setLocale({
  number: {
    positive: "Must be a positive number",
    negative: "Must be a negative number",
    integer: "Must be an integer",
    min: "Must be greater than or equal to ${min}",
    max: "Must be less than or equal to ${max}",
    moreThan: "Must be greater than ${moreThan}",
    lessThan: "Must be less than ${lessThan}",
  },
});

export default yup;
