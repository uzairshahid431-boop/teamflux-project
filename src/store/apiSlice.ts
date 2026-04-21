import { createApi } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn } from '@reduxjs/toolkit/query';
import axios from 'axios';
import type { AxiosRequestConfig, AxiosError } from 'axios';

const axiosBaseQuery =
  (
    { baseUrl }: { baseUrl: string } = { baseUrl: '' }
  ): BaseQueryFn<
    {
      url: string;
      method?: AxiosRequestConfig['method'];
      body?: AxiosRequestConfig['data'];
      data?: AxiosRequestConfig['data'];
      params?: AxiosRequestConfig['params'];
      headers?: AxiosRequestConfig['headers'];
    } | string,
    unknown,
    unknown
  > =>
  async (requestOpts) => {
    try {
      const token = localStorage.getItem('auth_token');
      const url = typeof requestOpts === 'string' ? requestOpts : requestOpts.url;
      const method = typeof requestOpts === 'string' ? 'GET' : requestOpts.method || 'GET';
      const data = typeof requestOpts === 'string' ? undefined : (requestOpts.body || requestOpts.data);
      const params = typeof requestOpts === 'string' ? undefined : requestOpts.params;
      const headers = typeof requestOpts === 'string' ? {} : (requestOpts.headers || {});

      const result = await axios({
        url: baseUrl + url,
        method,
        data,
        params,
        headers: {
          ...headers,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      return { data: result.data };
    } catch (axiosError) {
      const err = axiosError as AxiosError;
      return {
        error: {
          status: err.response?.status,
          data: err.response?.data || err.message,
        },
      };
    }
  };

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: axiosBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['Project', 'Team', 'TechnicalDebt', 'Session', 'Deprecation'],
  endpoints: (builder) => ({
    // Endpoints will be injected from specific files or defined here
    getProjects: builder.query<any[], void>({
      query: () => '/projects/',
      providesTags: ['Project'],
    }),
    getTeams: builder.query<any[], void>({
      query: () => '/teams/',
      providesTags: ['Team'],
    }),
    getTechnicalDebts: builder.query<any[], any>({
      query: (params) => ({
        url: '/technical-debts/',
        params,
      }),
      providesTags: ['TechnicalDebt'],
    }),
    getSessions: builder.query<any[], void>({
      query: () => '/growth-sessions/',
      providesTags: ['Session'],
    }),
    // Technical Debt Comments
    getDebtComments: builder.query<any[], number>({
      query: (debtId) => `/comments/${debtId}/comments`,
      providesTags: (_result, _error, debtId) => [{ type: 'TechnicalDebt', id: `COMMENTS-${debtId}` }],
    }),
    addDebtComment: builder.mutation<any, { debtId: number; comment: string }>({
      query: ({ debtId, comment }) => ({
        url: `/comments/${debtId}/comments`,
        method: 'POST',
        body: { comment },
      }),
      invalidatesTags: (_result, _error, { debtId }) => [{ type: 'TechnicalDebt', id: `COMMENTS-${debtId}` }],
    }),
    updateDebtComment: builder.mutation<any, { commentId: number; debtId: number; comment: string }>({
      query: ({ commentId, comment }) => ({
        url: `/comments/comments/${commentId}`,
        method: 'PUT',
        body: { comment },
      }),
      invalidatesTags: (_result, _error, { debtId }) => [{ type: 'TechnicalDebt', id: `COMMENTS-${debtId}` }],
    }),
    deleteDebtComment: builder.mutation<any, { commentId: number; debtId: number }>({
      query: ({ commentId }) => ({
        url: `/comments/comments/${commentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { debtId }) => [{ type: 'TechnicalDebt', id: `COMMENTS-${debtId}` }],
    }),
    // Technical Debt Dashboard
    getDebtDashboard: builder.query<any, void>({
      query: () => '/dashboard/technical-debt',
      providesTags: ['TechnicalDebt'],
    }),
    // Deprecations
    getDeprecations: builder.query<any[], void>({
      query: () => '/deprecations/deprecation',
      providesTags: ['Deprecation'],
    }),
    addDeprecation: builder.mutation<any, Partial<any>>({
      query: (body) => ({
        url: '/deprecations/deprecation',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Deprecation'],
    }),
    updateDeprecation: builder.mutation<any, { id: number; data: Partial<any> }>({
      query: ({ id, data }) => ({
        url: `/deprecations/deprecation/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Deprecation'],
    }),
    deleteDeprecation: builder.mutation<any, number>({
      query: (id) => ({
        url: `/deprecations/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Deprecation'],
    }),
    // Timeline
    addDeprecationTimeline: builder.mutation<any, { deprecationId: number; data: any }>({
      query: ({ deprecationId, data }) => ({
        url: `/deprecation_timeline/deprecations/${deprecationId}/timeline`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Deprecation'],
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useGetTeamsQuery,
  useGetTechnicalDebtsQuery,
  useGetSessionsQuery,
  useGetDebtCommentsQuery,
  useAddDebtCommentMutation,
  useUpdateDebtCommentMutation,
  useDeleteDebtCommentMutation,
  useGetDebtDashboardQuery,
  useGetDeprecationsQuery,
  useAddDeprecationMutation,
  useUpdateDeprecationMutation,
  useDeleteDeprecationMutation,
  useAddDeprecationTimelineMutation
} = apiSlice;
