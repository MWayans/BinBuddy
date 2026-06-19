export interface CvAlternative {
  trashnet_class: string;
  category: string;
  confidence: number;
}

export interface CvClassification {
  trashnet_class: string;
  category: string;
  confidence: number;
  model: string;
  checkpoint?: string;
  alternatives?: CvAlternative[];
}
