import type { NextPage } from 'next';
import { COPY } from '@learn-easy/ui';

const Home: NextPage = () => {
  return (
    <div>
      <h1>{COPY.appTitle} - Parent Dashboard</h1>
      <p>Track your child&apos;s learning progress</p>
    </div>
  );
};

export default Home;
