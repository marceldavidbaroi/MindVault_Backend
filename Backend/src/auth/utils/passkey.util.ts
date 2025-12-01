import { v4 as uuidv4 } from 'uuid';

export function generatePasskey(): string {
  return (
    uuidv4().split('-')[0].toUpperCase() +
    '-' +
    uuidv4().split('-')[1].toUpperCase() +
    '-' +
    uuidv4().split('-')[2].toUpperCase()
  );
}
