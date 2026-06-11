export interface IPasswordOptions {
	length: number;
	uppercase: boolean;
	lowercase: boolean;
	numbers: boolean;
	symbols: boolean;
}

export interface IPasswordResult {
	ok: boolean;
	output: string;
	error?: string;
}

const characterGroups = {
	uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
	lowercase: "abcdefghijklmnopqrstuvwxyz",
	numbers: "0123456789",
	symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
};

const randomIndex = (max: number) => {
	const values = new Uint32Array(1);
	globalThis.crypto.getRandomValues(values);
	return values[0] % max;
};

const randomCharacter = (characters: string) => characters[randomIndex(characters.length)];

const shuffleCharacters = (characters: string[]) => {
	for (let index = characters.length - 1; index > 0; index -= 1) {
		const swapIndex = randomIndex(index + 1);
		[characters[index], characters[swapIndex]] = [characters[swapIndex], characters[index]];
	}

	return characters.join("");
};

export const generatePassword = (options: IPasswordOptions): IPasswordResult => {
	const selectedGroups = [
		options.uppercase ? characterGroups.uppercase : "",
		options.lowercase ? characterGroups.lowercase : "",
		options.numbers ? characterGroups.numbers : "",
		options.symbols ? characterGroups.symbols : "",
	].filter(Boolean);

	if (!selectedGroups.length) {
		return { ok: false, output: "", error: "Select at least one character type" };
	}

	const safeLength = Math.max(options.length, selectedGroups.length);
	const allCharacters = selectedGroups.join("");
	const passwordCharacters = selectedGroups.map(randomCharacter);

	while (passwordCharacters.length < safeLength) {
		passwordCharacters.push(randomCharacter(allCharacters));
	}

	return { ok: true, output: shuffleCharacters(passwordCharacters) };
};

export const generatePasswords = (options: IPasswordOptions, count: number): IPasswordResult => {
	const results = Array.from({ length: count }, () => generatePassword(options));
	const failedResult = results.find((result) => !result.ok);

	if (failedResult) {
		return failedResult;
	}

	return { ok: true, output: results.map((result) => result.output).join("\n") };
};
