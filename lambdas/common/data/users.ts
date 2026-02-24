import type { MockUser } from '../types';

export const MOCK_USERS: MockUser[] = [
  {
    login: 'admin',
    password: 'admin!1',
    name: 'Admin User',
    email: 'admin@zoo.com'
  },
  {
    login: 'john',
    password: 'john!1',
    name: 'John Doe',
    email: 'john@zoo.com'
  },
  {
    login: 'test',
    password: 'test!1',
    name: 'Test User',
    email: 'test@zoo.com'
  }
];
