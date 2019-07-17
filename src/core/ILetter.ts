/**
 * @interface
 * Defines a letter
 */
export interface ILetter {
  key: string;
  title: string;
  type: LetterType;
}

export enum LetterType {
    Alpha,
    Numeric,
    NonAlphaNumeric
}