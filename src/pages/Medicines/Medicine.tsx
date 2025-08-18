import React, { useRef, useState } from 'react';

interface Medicine {
  id: number;
  name: string;
  brand: string;
  price: number;
  mrp: number;
  discount: string;
  image: string;
}

const medicines: Medicine[] = [
  {
    id: 1,
    name: 'Paracetamol',
    brand: 'Cipla',
    price: 20,
    mrp: 22,
    discount: '10% off',
    image:
      'https://5.imimg.com/data5/SELLER/Default/2021/12/LK/ON/KX/43755673/paracetamol-500mg-tablet.jpg',
  },
  {
    id: 2,
    name: 'Dolo 650',
    brand: 'Micro Labs',
    price: 30,
    mrp: 35,
    discount: '15% off',
    image:
      'https://www.shutterstock.com/editorial/image-editorial/MeT3I540OdD0E8weNDIwMzI=/dolo-650-paracetamol-tablet-recorded-most-prescribed-1500w-12773147c.jpg',
  },
  {
    id: 3,
    name: 'Body Wash',
    brand: 'Dove',
    price: 199,
    mrp: 234,
    discount: '15% off',
    image:
      'https://m.media-amazon.com/images/I/816nx6GthYL._AC_UF1000,1000_QL80_.jpg',
  },
  {
    id: 4,
    name: 'Amoxicillin',
    image:
      'https://www.shutterstock.com/image-illustration/amoxicillin-antibiotic-medication-used-treat-600nw-2225010241.jpg',
    price: 45,
    mrp: 60,
    discount: '25% off',
    brand: 'GSK',
  },
  {
    id: 5,
    name: 'Cetrizine',
    image:
      'https://5.imimg.com/data5/SELLER/Default/2023/12/365832512/EA/NW/AQ/188035340/cetirizine-tablet-ip.jpg',
    price: 15,
    mrp: 18,
    discount: '10% off',
    brand: 'Sun Pharma',
  },
  {
    id: 6,
    name: 'Wet Wipes',
    brand: 'Himalaya',
    price: 75,
    mrp: 75,
    discount: 'No offer',
    image:
      'https://media.istockphoto.com/id/1217609712/photo/pack-of-wipes.jpg?s=612x612&w=0&k=20&c=SAkgBUfFAhrs1VgSXjLd8XWU1MU6gSrBu9HROqkfXVU=',
  },
  {
    id: 7,
    name: 'Disprin',
    brand: 'Bayer',
    price: 40,
    mrp: 50,
    discount: '10%',
    image:
      'https://5.imimg.com/data5/SELLER/Default/2021/6/CF/DH/KZ/7175961/disprin-tablets.jpeg',
  },
  {
    id: 8,
    name: 'Metaformin',
    brand: 'Glycomet',
    price: 80,
    mrp: 80,
    discount: 'No offer',
    image:
      'https://images.apollo247.in/pub/media/catalog/product/o/k/oka0007_3.jpg',
  },
  {
    id: 9,
    name: 'Pantoprazole',
    brand: 'Pan 40',
    price: 50,
    mrp: 75,
    discount: '25%',
    image:
      'https://www.krishlarpharma.com/wp-content/uploads/2019/12/KRITZOL-40-tablet.jpg',
  },
  {
    id: 10,
    name: 'Ibuprofen',
    brand: 'Ibugesic (Cipla)',
    price: 30,
    mrp: 40,
    discount: '10%',
    image:
      'https://media.istockphoto.com/id/1359178057/photo/ibuprofen-pill-box-box-paper-blister-tablets.jpg?s=612x612&w=0&k=20&c=iqdliihgmXPtkeKW8NX_YprRGdoh1d-bdcO8sw1Tsmw=',
  },
];

const Medicine: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollIndex, setScrollIndex] = useState(0);
  const itemsPerPage = 4;
  const totalItems = medicines.length;
  const maxIndex = Math.ceil(totalItems / itemsPerPage) - 1;

  const filteredMedicines = medicines.filter((med) =>
    med.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const scrollToIndex = (index: number) => {
    if (scrollRef.current) {
      const containerWidth = scrollRef.current.offsetWidth;
      scrollRef.current.scrollTo({
        left: index * containerWidth,
        behavior: 'smooth',
      });
    }
    setScrollIndex(index);
  };

  return (
    <div
      id="Medicine"
      className="min-h-screen flex flex-col items-center justify-center p-4"
    >
      <h2 className="text-black text-center text-4xl">Medicines</h2>
      <p className="text-black mt-3 mb-10 text-center">Trusted by Thousands</p>

      {/* Search Input */}
      <div className="w-full max-w-7xl mb-6">
        <input
          type="text"
          placeholder="Enter medicine name"
          className="w-full rounded-lg border border-gray-300 bg-white py-2.5 px-4 pl-3 pr-2 text-lg text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Medicine Cards Carousel */}
      <div className="relative w-full max-w-7xl">
        {scrollIndex > 0 && (
          <button
            onClick={() => scrollToIndex(scrollIndex - 1)}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow rounded-full p-2 hover:bg-blue-100"
          >
            &lt;
          </button>
        )}

        <div
          ref={scrollRef}
          className="flex transition-all duration-500"
          style={{
            scrollBehavior: 'smooth',
            overflow: 'hidden',
            pointerEvents: 'none',
          }}
        >
          {filteredMedicines.map((med) => (
            <div
              key={med.id}
              className="medicine-card w-[calc(25%-1rem)] min-w-[250px] border border-blue-300 rounded-lg shadow-md bg-white hover:shadow-lg transition p-4 flex-shrink-0 mr-4"
            >
              <img
                src={med.image}
                alt={med.name}
                className="w-full h-32 object-cover rounded mb-3"
              />
              <h2 className="text-lg font-semibold text-gray-800">
                {med.name}
              </h2>
              <p className="text-sm text-gray-600">{med.brand}</p>
              <div className="mt-2 flex items-center space-x-2">
                <span className="text-black font-semibold text-lg">
                  ₹{med.price}
                </span>
                {med.mrp > med.price && (
                  <span className="line-through text-gray-500 text-sm">
                    MRP ₹{med.mrp}
                  </span>
                )}
                <span className="text-green-600 font-medium text-sm">
                  {med.discount}
                </span>
              </div>
              <button className="mt-3 w-full bg-gradient-to-b from-blue-700 to-blue-500 active:from-blue-800 active:to-blue-600 text-white py-2 rounded-full font-semibold text-sm transition duration-200 shadow-md hover:shadow-lg">
                ADD
              </button>
            </div>
          ))}
        </div>

        {scrollIndex < maxIndex && (
          <button
            onClick={() => scrollToIndex(scrollIndex + 1)}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow rounded-full p-2 hover:bg-blue-100"
          >
            &gt;
          </button>
        )}
      </div>
    </div>
  );
};

export default Medicine;


