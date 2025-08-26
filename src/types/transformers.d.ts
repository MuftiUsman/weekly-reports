declare module '@xenova/transformers' {
  export interface PipelineOptions {
    quantized?: boolean;
  }

  export interface SummarizationResult {
    summary_text: string;
  }

  export interface Pipeline {
    (text: string, options?: {
      max_length?: number;
      min_length?: number;
      do_sample?: boolean;
    }): Promise<SummarizationResult[]>;
  }

  export const pipeline: (
    task: string,
    model?: string,
    options?: PipelineOptions
  ) => Promise<Pipeline>;

  export const env: {
    allowLocalModels: boolean;
  };
}
