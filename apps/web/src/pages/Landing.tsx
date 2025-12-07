import HeroCredit from '../components/landing/HeroCredit';
import CategoriesGrid from '../components/landing/CategoriesGrid';
import TopPacksGrid from '../components/landing/TopPacksGrid';

const Landing = () => {
  return (
    <>
      {/* Hero Section */}
      <section className="py-24 md:py-32 lg:py-40">
        <div className="container-max">
          <HeroCredit />
        </div>
      </section>

      <CategoriesGrid />

      <TopPacksGrid />
    </>
  );
};

export default Landing;
