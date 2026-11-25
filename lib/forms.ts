import type { ErrorKey } from "./validations";

export type FormState = {
  status: "idle" | "error" | "success";
  errors: Record<string, ErrorKey>;
  formError?: ErrorKey;
  values: Record<string, string>;
  nonce: number;
};

export const initialFormState: FormState = { status: "idle", errors: {}, values: {}, nonce: 0 };
