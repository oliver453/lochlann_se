export interface BookingFormData {
  partySize: number;
  date: string;
  time: number;
  offerUuid?: string;
}

export interface CustomerInfo {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  locale: string;
  civility: 'mr' | 'mrs' | 'miss';
  customerNote?: string;
  optins: {
    restaurantNewsletter: boolean;
  };
}

export interface TheForkTimeslot {
  datetime: string;
  time: number;
  bestOffer: {
    offerType: string;
    uuid: string;
    __typename: string;
  } | null;
  availabilityType: string;
  __typename: string;
}

export interface TheForkAvailability {
  date: string;
  hasNormalStock: boolean;
  offerList: string[];
  bestOffer: {
    uuid: string;
    __typename: string;
  } | null;
  __typename: string;
}