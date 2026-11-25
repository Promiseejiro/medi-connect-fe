
import axios from 'axios';

const API_BASE = (
  process.env.NEXT_PUBLIC_MEDICONNECT_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:3000/api/v1'
).replace(/\/$/, '');

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach authentication token to requests.
if (typeof window !== 'undefined') {
  api.interceptors.request.use((config) => {
    const token = window.localStorage.getItem('mediconnect_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });
}

type AnyRecord = Record<string, any>;

const idOf = (value: any): string =>
  String(value?._id ?? value?.id ?? value ?? '');

// --------------------------------------------------
// NORMALIZERS
// --------------------------------------------------

function normalizeSpecialization(item: AnyRecord) {
  return {
    ...item,
    id: idOf(item),
    name: item.name ?? '',
  };
}

function normalizeDoctor(item: AnyRecord): Doctor {
  const user =
    item.user && typeof item.user === 'object'
      ? item.user
      : {};

  return {
    ...item,
    id: idOf(item),
    firstName: item.firstName ?? user.firstName ?? '',
    lastName: item.lastName ?? user.lastName ?? '',
    email: item.email ?? user.email ?? '',
    phone: item.phone ?? user.phone ?? '',
    published: item.published ?? false,
    specializations: Array.isArray(item.specializations)
      ? item.specializations.map(normalizeSpecialization)
      : [],
  };
}

function normalizeService(item: AnyRecord): DoctorService {
  const consultationType =
    item.consultationType === 'VIDEO' ||
      item.consultationType === 'PHONE' ||
      item.consultationType === 'ONLINE'
      ? 'ONLINE'
      : 'PHYSICAL';

  return {
    ...item,
    id: idOf(item),

    // Required service fields
    name: item.name ?? item.serviceName ?? '',
    description: item.description ?? '',
    price: Number(item.price ?? item.amount ?? 0),
    currency: 'USD',
    durationMinutes: Number(
      item.durationMinutes ?? item.duration ?? 30,
    ),

    consultationType,

    paymentRequired: item.paymentRequired ?? false,
    active: item.active !== false,
  };
}

function normalizeAvailability(item: AnyRecord): Availability {
  const days = [
    'SUNDAY',
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
  ];

  const day =
    typeof item.dayOfWeek === 'number'
      ? days[item.dayOfWeek] ?? ''
      : item.dayOfWeek ?? '';

  return {
    ...item,
    id: idOf(item),
    dayOfWeek: day,

    // Required availability fields
    startTime: item.startTime ?? item.start ?? '',
    endTime: item.endTime ?? item.end ?? '',

    active: item.active !== false,
  };
}

function normalizeBlockedDate(item: AnyRecord) {
  return {
    ...item,
    id: idOf(item),
  };
}

function normalizeNotification(item: AnyRecord) {
  return {
    ...item,
    id: idOf(item),
  };
}

function normalizeAppointment(item: AnyRecord): Appointment {
  const doctor =
    item.doctor && typeof item.doctor === 'object'
      ? normalizeDoctor(item.doctor)
      : undefined;

  const service =
    item.service && typeof item.service === 'object'
      ? normalizeService(item.service)
      : undefined;

  const patient =
    item.patient && typeof item.patient === 'object'
      ? {
        ...item.patient,
        id: idOf(item.patient),
      }
      : undefined;

  return {
    ...item,
    id: idOf(item),

    doctor,
    patient,
    service,

    // Required appointment date fields
    startsAt:
      item.startsAt ??
      item.startAt ??
      item.startTime ??
      item.appointmentDate ??
      '',

    endsAt:
      item.endsAt ??
      item.endAt ??
      item.endTime ??
      '',

    serviceNameSnapshot:
      item.serviceNameSnapshot ??
      service?.name ??
      'Healthcare appointment',

    priceSnapshot: Number(
      item.priceSnapshot ?? service?.price ?? 0,
    ),

    currencySnapshot:
      'USD',

    paymentRequired:
      item.paymentRequired ??
      service?.paymentRequired ??
      false,

    status:
      item.status === 'PENDING' &&
        item.paymentStatus === 'PENDING'
        ? 'PENDING_PAYMENT'
        : item.status ?? 'PENDING',
  };
}

/**
 * Unwraps Nest responses shaped as { message, data }
 * as well as plain responses.
 */
export function unwrap<T>(payload: any): T {
  let value = payload;

  for (
    let i = 0;
    i < 3 &&
    value &&
    typeof value === 'object' &&
    'data' in value;
    i++
  ) {
    value = value.data;
  }

  return value as T;
}

// --------------------------------------------------
// TYPES
// --------------------------------------------------

export type Role = 'PATIENT' | 'DOCTOR';

export interface AuthResult {
  accessToken: string;
  tokenType: string;
  expiresIn?: number;
  role: Role;
  userId: string;
  email: string;
}

export interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  profileImage?: string;
  bio?: string;
  qualification?: string;
  experienceYears?: number;
  clinicAddress?: string;
  published: boolean;
  specializations?: {
    id: string;
    name: string;
  }[];
}

export interface DoctorService {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  durationMinutes: number;
  consultationType: 'ONLINE' | 'PHYSICAL';
  paymentRequired: boolean;
  active: boolean;
}

export interface Availability {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  active: boolean;
}

export interface Appointment {
  id: string;
  startsAt: string;
  endsAt: string;
  status: string;
  priceSnapshot: number;
  currencySnapshot: string;
  serviceNameSnapshot: string;
  paymentRequired: boolean;
  paymentStatus?: string;
  doctor?: Doctor;
  patient?: any;
  service?: DoctorService;
}

export interface Specialization {
  id: string;
  name: string;
}

// --------------------------------------------------
// AUTH API
// --------------------------------------------------

export const authApi = {
  login: async (email: string, password: string) => {
    const response = unwrap<AnyRecord>(
      (
        await api.post('/auth/login', {
          email,
          password,
        })
      ).data,
    );

    const user = response.user ?? {};

    return {
      accessToken: response.accessToken,
      tokenType: response.tokenType ?? 'Bearer',
      expiresIn: response.expiresIn,
      role: user.role as Role,
      userId: idOf(user),
      email: user.email ?? email,
    } as AuthResult;
  },

  register: async (payload: AnyRecord) => {
    const response = unwrap<AnyRecord>(
      (
        await api.post('/auth/register', payload)
      ).data,
    );

    const user = response.user ?? {};

    return {
      accessToken: response.accessToken,
      tokenType: response.tokenType ?? 'Bearer',
      expiresIn: response.expiresIn,
      role: user.role as Role,
      userId: idOf(user),
      email: user.email ?? payload.email,
    } as AuthResult;
  },
};

// --------------------------------------------------
// DOCTORS API
// --------------------------------------------------

export const doctorsApi = {
  list: async () =>
    (
      unwrap<AnyRecord[]>(
        (await api.get('/doctors')).data,
      ) ?? []
    ).map(normalizeDoctor),

  get: async (id: string) =>
    normalizeDoctor(
      unwrap<AnyRecord>(
        (await api.get(`/doctors/${id}`)).data,
      ),
    ),

  mine: async () =>
    normalizeDoctor(
      unwrap<AnyRecord>(
        (await api.get('/doctors/me')).data,
      ),
    ),

  update: async (payload: AnyRecord) =>
    normalizeDoctor(
      unwrap<AnyRecord>(
        (await api.patch('/doctors/me', payload)).data,
      ),
    ),
};

// --------------------------------------------------
// DOCTOR SERVICES API
// --------------------------------------------------

export const servicesApi = {
  byDoctor: async (id: string) =>
    (
      unwrap<AnyRecord[]>(
        (
          await api.get('/doctor-services', {
            params: {
              doctorId: id,
            },
          })
        ).data,
      ) ?? []
    ).map(normalizeService),

  mine: async () =>
    (
      unwrap<AnyRecord[]>(
        (await api.get('/doctor-services/mine')).data,
      ) ?? []
    ).map(normalizeService),

  create: async (payload: AnyRecord) =>
    normalizeService(
      unwrap<AnyRecord>(
        (
          await api.post('/doctor-services', {
            ...payload,
            consultationType:
              payload.consultationType === 'ONLINE'
                ? 'VIDEO'
                : 'IN_PERSON',
          })
        ).data,
      ),
    ),

  update: async (id: string, payload: AnyRecord) =>
    normalizeService(
      unwrap<AnyRecord>(
        (
          await api.patch(
            `/doctor-services/${id}`,
            payload,
          )
        ).data,
      ),
    ),

  remove: async (id: string) =>
    api.delete(`/doctor-services/${id}`),
};

// --------------------------------------------------
// AVAILABILITY API
// --------------------------------------------------

export const availabilityApi = {
  mine: async () => {
    const doctor = await doctorsApi.mine();

    return (
      unwrap<AnyRecord[]>(
        (
          await api.get('/availability', {
            params: {
              doctorId: doctor.id,
            },
          })
        ).data,
      ) ?? []
    ).map(normalizeAvailability);
  },

  byDoctor: async (id: string) =>
    (
      unwrap<AnyRecord[]>(
        (
          await api.get('/availability', {
            params: {
              doctorId: id,
            },
          })
        ).data,
      ) ?? []
    ).map(normalizeAvailability),

  slots: async (
    doctorId: string,
    serviceId: string,
    date: string,
  ) => {
    const [hours, blocks] = await Promise.all([
      availabilityApi.byDoctor(doctorId),
      blockedDatesApi.byDoctor(doctorId),
    ]);

    const day = new Date(
      `${date}T00:00:00Z`,
    ).getUTCDay();

    const service = await servicesApi
      .byDoctor(doctorId)
      .then((items) =>
        items.find((x) => x.id === serviceId),
      );

    if (!service) return [];

    const slots: {
      startsAt: string;
      endsAt: string;
      available: boolean;
    }[] = [];

    if (
      blocks.some(
        (b: any) =>
          String(b.date).slice(0, 10) === date,
      )
    ) {
      return slots;
    }

    const days = [
      'SUNDAY',
      'MONDAY',
      'TUESDAY',
      'WEDNESDAY',
      'THURSDAY',
      'FRIDAY',
      'SATURDAY',
    ];

    for (
      const item of hours.filter(
        (h) =>
          h.active &&
          h.dayOfWeek === days[day],
      )
    ) {
      if (!item.startTime || !item.endTime) {
        continue;
      }

      const [sh, sm] = item.startTime
        .split(':')
        .map(Number);

      const [eh, em] = item.endTime
        .split(':')
        .map(Number);

      const start = new Date(
        `${date}T00:00:00Z`,
      );

      start.setUTCHours(sh, sm, 0, 0);

      const endLimit = new Date(
        `${date}T00:00:00Z`,
      );

      endLimit.setUTCHours(eh, em, 0, 0);

      while (
        start.getTime() +
        service.durationMinutes * 60000 <=
        endLimit.getTime()
      ) {
        const end = new Date(
          start.getTime() +
          service.durationMinutes * 60000,
        );

        if (start > new Date()) {
          slots.push({
            startsAt: start.toISOString(),
            endsAt: end.toISOString(),
            available: true,
          });
        }

        start.setUTCMinutes(
          start.getUTCMinutes() +
          service.durationMinutes,
        );
      }
    }

    return slots;
  },

  create: async (payload: AnyRecord) =>
    api.post('/availability', {
      ...payload,
      dayOfWeek: [
        'SUNDAY',
        'MONDAY',
        'TUESDAY',
        'WEDNESDAY',
        'THURSDAY',
        'FRIDAY',
        'SATURDAY',
      ].indexOf(payload.dayOfWeek),
    }),

  remove: async (id: string) =>
    api.delete(`/availability/${id}`),
};

// --------------------------------------------------
// APPOINTMENTS API
// --------------------------------------------------

export const appointmentsApi = {
  mine: async () =>
    (
      unwrap<AnyRecord[]>(
        (await api.get('/appointments/mine')).data,
      ) ?? []
    ).map(normalizeAppointment),

  create: async (
    doctorId: string,
    serviceId: string,
    startsAt: string,
  ) =>
    normalizeAppointment(
      unwrap<AnyRecord>(
        (
          await api.post('/appointments', {
            doctorId,
            serviceId,
            startsAt,
          })
        ).data,
      ),
    ),

  cancel: async (id: string, reason?: string) =>
    normalizeAppointment(
      unwrap<AnyRecord>(
        (
          await api.patch(
            `/appointments/${id}/cancel`,
            {
              reason,
            },
          )
        ).data,
      ),
    ),
};

// --------------------------------------------------
// PATIENT API
// --------------------------------------------------

export const patientApi = {
  me: async () =>
    unwrap<AnyRecord>(
      (await api.get('/patients/me')).data,
    ),

  update: async (payload: AnyRecord) =>
    unwrap<AnyRecord>(
      (
        await api.patch(
          '/patients/me',
          payload,
        )
      ).data,
    ),
};

// --------------------------------------------------
// PAYMENTS API
// --------------------------------------------------

export const paymentApi = {
  checkout: async (appointmentId: string) =>
    unwrap<AnyRecord>(
      (
        await api.post('/payments/checkout', {
          appointmentId,
        })
      ).data,
    ),
};

// --------------------------------------------------
// NOTIFICATIONS API
// --------------------------------------------------

export const notificationsApi = {
  list: async () =>
    (
      unwrap<AnyRecord[]>(
        (await api.get('/notifications')).data,
      ) ?? []
    ).map(normalizeNotification),

  read: async (id: string) =>
    api.patch(`/notifications/${id}/read`),
};

// --------------------------------------------------
// SPECIALIZATIONS API
// --------------------------------------------------

export const specializationsApi = {
  list: async () =>
    (
      unwrap<AnyRecord[]>(
        (await api.get('/specializations')).data,
      ) ?? []
    ).map(normalizeSpecialization),
};

// --------------------------------------------------
// SESSION MANAGEMENT
// --------------------------------------------------

export function saveSession(auth: AuthResult) {
  localStorage.setItem(
    'mediconnect_token',
    auth.accessToken,
  );

  localStorage.setItem(
    'mediconnect_role',
    auth.role,
  );

  localStorage.setItem(
    'mediconnect_email',
    auth.email,
  );

  localStorage.setItem(
    'mediconnect_user_id',
    String(auth.userId),
  );
}

export function clearSession() {
  localStorage.removeItem('mediconnect_token');
  localStorage.removeItem('mediconnect_role');
  localStorage.removeItem('mediconnect_email');
  localStorage.removeItem('mediconnect_user_id');
}

export function getRole(): Role | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const role = localStorage.getItem(
    'mediconnect_role',
  );

  return role === 'PATIENT' || role === 'DOCTOR'
    ? role
    : null;
}

// --------------------------------------------------
// UTILITY FUNCTIONS
// --------------------------------------------------

export function money(
  amount: number,
  _currency = 'USD',
) {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Number(amount || 0));
  } catch {
    return `$${Number(amount || 0).toLocaleString('en-US')}`;
  }
}

export function apiError(error: any) {
  const message =
    error?.response?.data?.message ??
    error?.response?.data?.error ??
    error?.message;

  return Array.isArray(message)
    ? message.join(', ')
    : message ||
    'Something went wrong. Please try again.';
}

// --------------------------------------------------
// BLOCKED DATES API
// --------------------------------------------------

export const blockedDatesApi = {
  mine: async () => {
    const doctor = await doctorsApi.mine();

    return blockedDatesApi.byDoctor(doctor.id);
  },

  byDoctor: async (doctorId: string) =>
    (
      unwrap<AnyRecord[]>(
        (
          await api.get('/blocked-dates', {
            params: {
              doctorId,
            },
          })
        ).data,
      ) ?? []
    ).map(normalizeBlockedDate),

  create: async (payload: AnyRecord) =>
    api.post('/blocked-dates', {
      date: payload.date,
      reason: payload.reason,
    }),

  remove: async (id: string) =>
    api.delete(`/blocked-dates/${id}`),
};
