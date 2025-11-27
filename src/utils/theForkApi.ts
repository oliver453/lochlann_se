import type { TheForkAvailability, TheForkTimeslot, CustomerInfo } from "../../types/booking";

const RESTAURANT_UUID = "1e84bc93-cf21-42ac-8bc2-6d2c234f393e";
const RESTAURANT_ID = "FYLL_I_MED_RÄTT_ID"; // You'll need to get this ID
const GRAPHQL_ENDPOINT = "https://widget.thefork.com/api/graphql";
const RESERVATION_ENDPOINT = `https://api.thefork.io/manager/v1/restaurants/${RESTAURANT_ID}/reservations`;

export const fetchAvailabilities = async (
  partySize: number,
  startDate: string,
  endDate: string,
): Promise<TheForkAvailability[]> => {
  const query = `
    query GetAvailabilities($restaurantUuid: ID!, $startDate: String!, $endDate: String!, $partySize: Int, $includeWaitingList: Boolean) {
      availabilities(
        restaurantUuid: $restaurantUuid
        startDate: $startDate
        endDate: $endDate
        partySize: $partySize
        includeWaitingList: $includeWaitingList
      ) {
        date
        hasNormalStock
        offerList
        bestOffer {
          uuid
          __typename
        }
        __typename
      }
    }
  `;

  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      operationName: "GetAvailabilities",
      query,
      variables: {
        restaurantUuid: RESTAURANT_UUID,
        startDate,
        endDate,
        partySize,
        includeWaitingList: true,
      },
    }),
  });

  const data = await response.json();
  return data.data?.availabilities || [];
};

export const fetchTimeslots = async (
  date: string,
  partySize: number,
): Promise<TheForkTimeslot[]> => {
  const query = `
    query GetTimeslots($restaurantUuid: ID!, $date: String!, $partySize: Int!, $includeWaitingList: Boolean, $timeslotFilter: TimeslotFilter) {
      timeslots(
        restaurantUuid: $restaurantUuid
        date: $date
        partySize: $partySize
        includeWaitingList: $includeWaitingList
        timeslotFilter: $timeslotFilter
      ) {
        datetime
        time
        bestOffer {
          offerType
          uuid
          __typename
        }
        availabilityType
        __typename
      }
    }
  `;

  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      operationName: "GetTimeslots",
      query,
      variables: {
        restaurantUuid: RESTAURANT_UUID,
        date,
        partySize,
        includeWaitingList: true,
        timeslotFilter: {
          after: { timeslot: 0, included: true },
          before: { timeslot: 1740, included: true },
        },
      },
    }),
  });

  const data = await response.json();
  return data.data?.timeslots || [];
};

export const createReservation = async (
  mealDateTime: string,
  partySize: number,
  offerUuid: string,
  customerInfo: CustomerInfo,
): Promise<{ success: boolean; reservationId?: string; error?: string }> => {
  try {
    const response = await fetch(RESERVATION_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "*/*",
        // You'll need to add authorization headers here
        // "Authorization": "Bearer your-api-token"
      },
      body: JSON.stringify({
        mealDate: mealDateTime,
        partySize,
        offerUuid,
        customerNote: customerInfo.customerNote || "",
        customer: {
          email: customerInfo.email,
          firstName: customerInfo.firstName,
          lastName: customerInfo.lastName,
          phone: customerInfo.phone,
          locale: customerInfo.locale,
          civility: customerInfo.civility,
          optins: customerInfo.optins,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.message || `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      reservationId: data.id || data.reservationId,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};