export type WordMapping = Record<string, string>;

export type Char =
    // Uppercase Characters
    "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K" | "L" | "M" | 
    "N" | "O" | "P" | "Q" | "R" | "S" | "T" | "U" | "V" | "W" | "X" | "Y" | "Z" | 
    // Lowercase Characters
    "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h" | "i" | "j" | "k" | "l" | "m" | 
    "n" | "o" | "p" | "q" | "r" | "s" | "t" | "u" | "v" | "w" | "x" | "y" | "z" |
    // Special Characters
    "-";

export type Node = {
    depth: number,
    word?: string,
    mapping?: string,
} & { [k in Char]?: Node };

export type TokenWithSource = {
    source: string,
    token?: string,
};

export class PrefixTree {
    constructor(root: Node) {
        this.root = root;
    }

    static fromWords(words: WordMapping): PrefixTree {
        const root: Node = { depth: 0 };
        let current = root;

        for (const [source, target] of Object.entries(words)) {
            let depth = 1;

            for (const sch of source) {
                if (!current[sch]) {
                    current[sch] = { depth: depth };
                }

                current = current[sch];
                ++depth;
            }

            if (current.word) {
                throw new Error(`duplicate word entry found for source word "${source}" during building of trie`);
            }

            if  (current.mapping) {
                throw new Error(`duplicate mapping entry found for source word "${source}" -> "${target}" during building of trie`);
            }

            current.word = source;
            current.mapping = target;
            current = root;
        }

        return new PrefixTree(root);
    }

    searchWord(word: string): string | null {
        let current = this.root;

        for (let i = 0; i <= word.length; ++i) {
            const ch = word[i];

            if (current.word && current.mapping && word.toLowerCase() === current.word.toLowerCase()) {
                return current.mapping;
            }

            if (ch in current) {
                current = current[ch];
            }
        }

        return null;
    }

    searchAllWords(text: string, returnSource: boolean = false): Array<string> {
        const allWords: Array<TokenWithSource> = text
            .toLowerCase()
            .split(" ")
            .map((source) => {
                const matches = source.match(/[A-z\-]+/);
                if (matches === null || matches.length === 0) return { source: source };
                return { source: source, token: matches[0].toLowerCase() };
            });

        const matches: Array<string> = [];

        for (const word of allWords) {
            if (!word.token) { continue; }

            const match = this.searchWord(word.token);
            if (match !== null) {
                const sourceWordUniformMatch = word.source.match(/\b[A-z\-]+\b/);
                const sourceWordUniform = (sourceWordUniformMatch !== null && sourceWordUniformMatch.length > 0)
                    ? sourceWordUniformMatch[0]
                    : word.source;

                matches.push((returnSource) ? sourceWordUniform : match);
            }
        }

        return matches;
    }

    revealAllWords(text: string,
                   placeholder: string = "_",
                   returnSource: boolean = false): string {
        const allWords: Array<TokenWithSource> = text
            .split(" ")
            .map((source) => {
                const matches = source.match(/[A-z\-]+/);
                if (matches === null || matches.length === 0) return { source: source };
                return { source: source, token: matches[0].toLowerCase() };
            });

        const matches: Array<string> = [];

        for (const word of allWords) {
            const sourceWordUniformMatch = word.source.match(/\b[A-z\-]+\b/);
            const sourceWordUniform = (sourceWordUniformMatch !== null && sourceWordUniformMatch.length > 0)
                ? sourceWordUniformMatch[0]
                : word.source;

            const placeholderText = word.source.replace(
                /\b.+\b/,
                placeholder.repeat(sourceWordUniform.length)
            );

            if (!word.token) {
                matches.push(placeholderText);
                continue;
            }

            const match = this.searchWord(word.token);
            if (match !== null) {
                const substituted = word.source.replace(/\b[A-z\-]+\b/, match);
                matches.push((returnSource) ? word.source : substituted);
            } else {
                matches.push(placeholderText);
            }
        }

        return matches.join(" ");
    }

    transposeText(text: string): string {
        const allWords: Array<TokenWithSource> = text
            .split(" ")
            .map((source) => {
                const matches = source.match(/[A-z\-]+/);
                if (matches === null || matches.length === 0) return { source: source };
                return { source: source, token: matches[0].toLowerCase() };
            });

        const matches: Array<string> = [];
        for (const word of allWords) {
            if (!word.token) {
                matches.push(word.source);
                continue;
            }

            const match = this.searchWord(word.token);
            if (match !== null) {
                const substituted = word.source.replace(/\b[A-z\-]+\b/, match);
                matches.push(substituted);
            } else {
                matches.push(word.source);
            }
        }

        return matches.join(" ");
    }

    root: Node;
}
