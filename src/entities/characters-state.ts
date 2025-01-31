import { atomWithStorage } from "jotai/utils";
import { withImmer } from "jotai-immer";

import type { KanaType } from "./characters";

import { allCharacters } from "./characters";

export type CharacterState = {
	kana: string;
	weight: number;
};
const defaultLearningState: CharacterState[] = allCharacters.map(({ kana }) => ({ kana, weight: 2 ** 32 }));

const storageLearningStateAtom = atomWithStorage("learningState", defaultLearningState);
export const learningStateAtom = withImmer(storageLearningStateAtom);

const defaultSelectedColumns: Record<KanaType, boolean[]> = {
	hiragana: Array(16).fill(false),
	"hiragana-combos": Array(16).fill(false),
	katakana: Array(16).fill(false),
	"katakana-combos": Array(16).fill(false),
};
const storageSelectedColumnsAtom = atomWithStorage("selectedColumns", defaultSelectedColumns);
export const selectedColumnsAtom = withImmer(storageSelectedColumnsAtom);
