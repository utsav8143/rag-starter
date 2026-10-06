import {embedMany} from "ai";

const embedding= 'text-embedding-ada-002';

const generateChunks = (input: string): string[]=>{
    return input
    .trim()
    .split('.')
    .filter(i=>i !== '')
};

export const generateEmbeddings= async (
    value:string,
): Promise<Array<{embedding:number[]; content:string}>> =>{
    const chunks=generateChunks(value);
    const {embeddings}=await embedMany({
        model:embedding,
        values: chunks,
    });
    return embeddings.map((e, i) => ({content: chunks[i], embedding: e}));
}