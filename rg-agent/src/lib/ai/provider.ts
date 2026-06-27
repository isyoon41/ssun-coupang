export interface RunAgentParams<TInput> {
  agentType: string;
  input: TInput;
  systemPrompt?: string;
  userPrompt?: string;
}

export interface AiProvider {
  runAgent<TInput, TOutput>(params: RunAgentParams<TInput>): Promise<TOutput>;
}
