export type Spot = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  status: 'posted' | 'vacant';
  memo?: string;
  current_poster_name?: string;
  current_deadline?: string;
  created_by?: string;
  created_at?: string;
  project_id?: string;
};

export type Report = {
  id: string;
  spot_id?: string;
  type: 'post' | 'remove';
  photo_url?: string;
  memo?: string;
  poster_name?: string;
  removal_deadline?: string;
  created_at: string;
  performed_by?: {
    display_name?: string;
  };
  spot?: {
    name: string;
  };
  reaction_counts?: Record<string, number>;
  is_liked?: boolean;
  thumbs_up_count?: number;
};

export type Project = {
  id: string;
  name: string;
  description?: string;
  details?: string;
  created_by: string;
  created_at: string;
  start_date?: string;
  end_date?: string;
  start_at?: string;
  end_at?: string;
  thumbnail_url?: string;
  visibility?: 'public' | 'private' | 'secret' | 'collaborate';
  map_config?: {
    center: { lat: number; lng: number };
    range: { ns: number; ew: number }; // meters
  };
};

export type ProjectJoinRequest = {
  id: string;
  project_id: string;
  user_id: string;
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string;
  reviewed_at?: string | null;
  reviewed_by?: string | null;
  user?: {
    display_name?: string | null;
    email?: string | null;
  };
};

export type ProjectMember = {
  project_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
  user?: {
    display_name: string;
    email: string;
  };
};
