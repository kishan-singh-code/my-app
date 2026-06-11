import MD5 from "crypto-js/md5";
import SHA256 from "crypto-js/sha256";

export type IHashAlgorithm = "sha256" | "md5";

export const generateHash = (value: string, algorithm: IHashAlgorithm) => {
	return algorithm === "sha256" ? SHA256(value).toString() : MD5(value).toString();
};
