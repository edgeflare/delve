export interface Item {
  id?: string | number;
  name?: string;
  category?: string;
  tags?: string[];
  desc?: string;
  avatar?: string;
  banner?: string;
  path?: string;   // app-internal /example/path
  exturl?: string; // external https://example.com
  labels?: Record<string, string | number | boolean>;
}
