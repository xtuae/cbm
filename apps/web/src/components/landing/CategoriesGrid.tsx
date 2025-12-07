import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Chip } from '../ui';

interface Category {
  id: string;
  name: string;
  slug: string;
}

const CategoriesGrid = () => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // TODO: If API endpoint exists, use /api/categories instead
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name', { ascending: true });

        if (error || !data || data.length === 0) {
          // Fallback to static categories
          setCategories([
            { id: 'game-credits', name: 'Game Credits', slug: 'game-credits' },
            { id: 'cloud-services', name: 'Cloud Services', slug: 'cloud-services' },
            { id: 'productivity-apps', name: 'Productivity Apps', slug: 'productivity-apps' },
            { id: 'advertising-credits', name: 'Advertising Credits', slug: 'advertising-credits' },
            { id: 'api-services', name: 'API Services', slug: 'api-services' },
            { id: 'data-storage', name: 'Data Storage', slug: 'data-storage' },
          ]);
        } else {
          setCategories(data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Use fallback
        setCategories([
          { id: 'game-credits', name: 'Game Credits', slug: 'game-credits' },
          { id: 'cloud-services', name: 'Cloud Services', slug: 'cloud-services' },
          { id: 'productivity-apps', name: 'Productivity Apps', slug: 'productivity-apps' },
          { id: 'advertising-credits', name: 'Advertising Credits', slug: 'advertising-credits' },
          { id: 'api-services', name: 'API Services', slug: 'api-services' },
          { id: 'data-storage', name: 'Data Storage', slug: 'data-storage' },
        ]);
      }
    };

    fetchCategories();
  }, []);

  return (
    <section className="py-8">
      <div className="container-max">
        <div className="flex space-x-4 overflow-x-auto pb-4 justify-center">
          {categories.map((brand) => (
            <Chip key={brand.id} className="flex-shrink-0">
              {brand.name}
            </Chip>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesGrid;
