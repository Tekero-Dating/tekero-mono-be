import { JwtService } from '@nestjs/jwt';

const mockJwtService = new JwtService({ secret: 'testSecret' }); // Use the same secret as in your app
const mockUserPayload = { sub: 2, email: 'test@example.com' }; // Mock user payload

export const generateMockToken = (): string => {
  return mockJwtService.sign(mockUserPayload);
};
