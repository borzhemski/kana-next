"use client";

import { allCharactersKV, Character, hiraganaComboTable, hiraganaTable, KanaType, katakanaComboTable, katakanaTable } from "@/entities/characters";
import { CharacterState, learningStateAtom, selectedColumnsAtom } from "@/entities/characters-state";
import { cn } from "@/utils/cn";
import { useAtom } from "jotai";
import { useState } from "react";
import { prop, sortBy } from "remeda";

import { GuessInput } from "./guess-input";

const increaseWeight = (currentWeight: number) => {
	return Math.min(Math.max(currentWeight * 1.5, 2), Number.MAX_SAFE_INTEGER);
};

const calculateCDF = (characters: CharacterState[]) => {
	const totalWeightInverse = characters.reduce<number>((acc, { weight }) => {
		return acc + 1 / weight;
	}, 0);

	let cumulativeSum = 0;
	return characters.map(({ weight }) => {
		cumulativeSum += 1 / weight;
		return cumulativeSum / totalWeightInverse;
	});
};

const getWeightedCharacter = (characters: CharacterState[]): (Character & CharacterState) | null => {
	const sortedCharacters = sortBy(characters, prop("weight"));

	const cdfValues = calculateCDF(sortedCharacters);
	const randomNumber = Math.random();
	const index = cdfValues.findIndex((value) => value >= randomNumber);
	if (index === -1) {
		return null;
	}
	const character = sortedCharacters[index];

	return { ...character, ...allCharactersKV[character.kana] };
};

const getSelectedTableKanas = (selectedTable: boolean[], tableLayout: (null | string)[][]) => {
	return selectedTable.reduce<string[]>((acc, isSelected, columnIndex) => {
		if (!isSelected) {
			return acc;
		}
		acc.push(
			...tableLayout.reduce<string[]>((acc, row) => {
				if (row[columnIndex] !== null) {
					acc.push(row[columnIndex]);
				}
				return acc;
			}, [])
		);

		return acc;
	}, []);
};

const getSelectedKanas = (selectedColumns: Record<KanaType, boolean[]>) => [
	...getSelectedTableKanas(selectedColumns.hiragana, hiraganaTable),
	...getSelectedTableKanas(selectedColumns["hiragana-combos"], hiraganaComboTable),
	...getSelectedTableKanas(selectedColumns.katakana, katakanaTable),
	...getSelectedTableKanas(selectedColumns["katakana-combos"], katakanaComboTable),
];

const getCharacterToGuess = (selectedKanas: string[], learningState: CharacterState[]) => {
	const selectedLearningState = learningState.filter(({ kana }) => selectedKanas.includes(kana));
	return getWeightedCharacter(selectedLearningState);
};

export const GuessContainer = () => {
	const [isError, setIsError] = useState(false);
	const [stats, setStats] = useState({ correct: 0, incorrect: 0 });
	const [inputValue, setInputValue] = useState("");
	const [learningState, setLearningState] = useAtom(learningStateAtom);
	const [selectedColumns] = useAtom(selectedColumnsAtom);
	const selectedKanas = getSelectedKanas(selectedColumns);
	const characterToGuess = getCharacterToGuess(selectedKanas, learningState);

	const onInputChange = (newInputValue: string) => {
		if (!characterToGuess) {
			return;
		}

		if (newInputValue === characterToGuess.romaji) {
			setLearningState((draft) => {
				const character = draft.find(({ kana }) => kana === characterToGuess.kana)!;
				character.weight = increaseWeight(character.weight);
			});
			setInputValue("");
			setIsError(false);
			setStats((v) => ({ ...v, correct: v.correct + 1 }));
		} else if (characterToGuess.romaji.startsWith(newInputValue)) {
			setInputValue(newInputValue);
		} else {
			setLearningState((draft) => {
				const character = draft.find(({ kana }) => kana === characterToGuess.kana)!;
				character.weight = character.weight / 2;
			});
			setInputValue("");
			setStats((v) => ({ ...v, incorrect: v.incorrect + 1 }));
			setIsError(true);
		}
	};

	console.log({ characterToGuess, inputValue, selectedKanas });
	return (
		<div className="flex flex-col items-center gap-2">
			{characterToGuess ? (
				<span className={cn("text-5xl font-bold", { "text-red-500": isError })}>{characterToGuess.kana}</span>
			) : (
				<span className="text-lg leading-[3rem]">Choose columns to grind</span>
			)}
			<span>
				{stats.correct}/{stats.correct + stats.incorrect}
			</span>
			<GuessInput setValue={onInputChange} value={inputValue} />
		</div>
	);
};
