'use client';

import { useMemo } from 'react';
import { getIstanbulDistricts, getNeighborhoodsForDistrict } from '@/lib/istanbul-locations';
import { inputClass, labelClass } from './listings-shared';

interface Props {
  district: string;
  neighborhood: string;
  onDistrictChange: (value: string) => void;
  onNeighborhoodChange: (value: string) => void;
  layout?: 'grid' | 'stack';
}

export function DistrictNeighborhoodFields({
  district,
  neighborhood,
  onDistrictChange,
  onNeighborhoodChange,
  layout = 'grid',
}: Props) {
  const districts = useMemo(() => getIstanbulDistricts(), []);
  const neighborhoods = useMemo(() => getNeighborhoodsForDistrict(district), [district]);

  function handleDistrictChange(value: string) {
    onDistrictChange(value);
    onNeighborhoodChange('');
  }

  const containerClass = layout === 'grid' ? 'grid gap-4 sm:grid-cols-2' : 'space-y-3';

  return (
    <div className={containerClass}>
      <label className="block space-y-1.5">
        <span className={labelClass}>İlçe</span>
        <select value={district} onChange={(e) => handleDistrictChange(e.target.value)} className={inputClass}>
          <option value="">Seçiniz</option>
          {districts.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </label>

      <label className="block space-y-1.5">
        <span className={labelClass}>Mahalle</span>
        <select
          value={neighborhood}
          onChange={(e) => onNeighborhoodChange(e.target.value)}
          disabled={!district}
          className={`${inputClass} disabled:cursor-not-allowed disabled:bg-iteo-gray-50 disabled:text-iteo-gray-400`}
        >
          <option value="">{district ? 'Seçiniz' : 'Önce ilçe seçin'}</option>
          {neighborhoods.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
