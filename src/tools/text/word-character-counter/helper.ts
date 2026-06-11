export interface ITextStats {
	characters: number;
	charactersNoSpaces: number;
	words: number;
	lines: number;
	paragraphs: number;
	sentences: number;
	readingMinutes: number;
}

export const analyzeText = (value: string): ITextStats => {
	const trimmedValue = value.trim();
	const words = trimmedValue.match(/[A-Za-z0-9]+(?:['-][A-Za-z0-9]+)*/g) ?? [];
	const paragraphs = trimmedValue ? trimmedValue.split(/\n\s*\n/).filter(Boolean).length : 0;
	const sentences = trimmedValue ? trimmedValue.split(/[.!?]+/).filter((sentence) => sentence.trim()).length : 0;

	return {
		characters: value.length,
		charactersNoSpaces: value.replace(/\s/g, "").length,
		words: words.length,
		lines: value ? value.split(/\r\n|\r|\n/).length : 0,
		paragraphs,
		sentences,
		readingMinutes: words.length ? Math.max(1, Math.ceil(words.length / 200)) : 0,
	};
};
