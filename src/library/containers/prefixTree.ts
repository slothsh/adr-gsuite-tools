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
    token: string,
    source: string,
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

    searchWordsAll(text: Array<string>): Array<string> {
        const matches: Array<string> = [];

        for (const word of text) {
            const match = this.searchWord(word);
            if (match !== null) {
                matches.push(match);
            } else {
                matches.push(word);
            }
        }

        return matches;
    }

    root: Node;
}
