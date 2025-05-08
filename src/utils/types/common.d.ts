export type UserT = {
  id: number;
  email: string;
  contact_number: string;
  branch_name: string;
  series_ids: number[];
  avatar: string;
  type: string;
  address: AddressT;
  shipping_region: string | null;
  shipping_address: string | null;
  full_name: string;
  blocked: boolean;
  discount_rate: number;
  primary_address: null | string;
  primary_full_address: null | string;
  default_fulfillment: string;
};

export type AddressT = {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
};

export type SeriesT = {
  id: number;
  title: string;
  description: string | null;
  publisher_id: number | null;
  store_id: number | null;
  created_at: string;
  updated_at: string;
  user_id: number | null;
  code: string | null;
  subtitle: string | null;
};

export type CartItemT = {
  id: number; // cart item id
  product_id: number;
  product_item_id: number;
  product: ProductT;
  product_item: any; // You can define a more specific type if needed
  price: string | null;
  product_title: string;
  user_id: number;
  reservation?: any;
  reservation_id?: number | null;
};

export type ProductT = {
  id: number;
  title: string;
  cover_price: string;
  price: string;
  quantity: number | null;
  featured: boolean;
  hidden: boolean;
  description: string;
  creators: string;
  series: Series;
  slug: string;
  isbn: string | null;
  upc: string;
  publisher_id: number;
  category_id: number;
  series_id: number;
  issue_number: string;
  year: number | null;
  cover_url: string;
  cover_url_large: string;
  formatted_price: string;
  publisher_name: string;
  category_name: string;
  meta_attributes: Record<string, unknown>;
};

export type CreatorT = {
  id: string;
  name: string;
  avatar: string;
};

// New types for WantList and ReservationBox
export type WantListItemT = {
  id: number;
  product_id: number;
  user_id: number;
  fulfilled?: boolean;
  created_at?: string;
  updated_at?: string;
  product?: {
    id: number;
    title: string;
    cover_price?: string;
    price?: string;
    formatted_price?: string;
    creators?: string;
    cover_file_name?: string;
    cover_content_type?: "image/jpeg";
    cover_file_size?: number;
    cover_updated_at?: string;
    description?: string;
    issue_number?: string;
  };
};

export type ReservationItemT = {
  id: number;
  product_id: number;
  quantity: number;
  status: string;
  created_at?: string;
  updated_at?: string;
  product?: {
    id: number;
    title: string;
    cover_price?: string;
    price?: string;
    formatted_price?: string;
    creators?: string;
    cover_file_name?: string;
    cover_content_type?: "image/jpeg";
    cover_file_size?: number;
    cover_updated_at?: string;
    description?: string;
    issue_number?: string;
  };
};
