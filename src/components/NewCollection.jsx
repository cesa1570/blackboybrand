import React from "react";

export default function NewCollection() {
  const collections = [
    {
      title: "Performance Series",
      subtitle: "Compression Technology",
      description: "สัมผัสความสบายระดับถัดไปด้วยชุดออกกำลังกายที่มาพร้อมเทคโนโลยีการบีบรัดขั้นสูง ออกแบบมาเพื่อนักกีฬาที่ต้องการความสามารถในการระบายเหงื่อและรองรับกล้ามเนื้อได้ดีที่สุด",
      features: ["ผ้ายืดได้ 4 ทิศทาง", "เทคโนโลยีกันกลิ่น", "แห้งเร็ว"],
      img: "./New.png",
      color: "from-blue-50 to-blue-100"
    },
     {
      title: "Hoodie Collection",
      subtitle: "ความอบอุ่นที่มีสไตล์",
      description: "สัมผัสความสบายและอบอุ่นในทุกวันด้วยฮู้ดดี้ดีไซน์เท่ ผลิตจากวัสดุคุณภาพสูง เหมาะสำหรับทั้งวันสบาย ๆ หรือสไตล์สตรีทลุคที่โดดเด่น",
      features: ["ผ้าฝ้ายขนหนูเนื้อนุ่ม", "ฮู้ดปรับได้พร้อมเชือกผูก", "กระเป๋าหน้าสำหรับเก็บของและความอบอุ่น"],
      img: "/New1.png",
      color: "from-purple-50 to-purple-100"
    },
    {
      title: "Jacket Collection",
      subtitle: "เท่ทุกองศาในทุกสภาพอากาศ",
      description: "แจ็คเก็ตดีไซน์ร่วมสมัยที่ผสานแฟชั่นกับฟังก์ชันการใช้งานอย่างลงตัว เหมาะสำหรับสภาพอากาศเย็นหรือวันฝนตก มาพร้อมดีเทลที่ออกแบบมาเพื่อความสะดวกและความเท่ในทุกวัน",
      features: ["กันลมและละอองน้ำ", "ซับในนุ่มใส่สบาย", "กระเป๋าหลายช่องใช้งานได้จริง"],
      img: "/New2.png",
      color: "from-red-50 to-red-100"
    }
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
          <p className="text-sm uppercase tracking-[0.3em] text-gray-300 mb-4">
            Coming Soon
          </p>
          <h1 className="text-5xl lg:text-7xl font-light mb-6 leading-tight">
            New Collection
          </h1>
          <p className="text-lg lg:text-xl font-light text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            เตรียมพบกับคอลเลกชันใหม่ที่จะเปลี่ยนแปลงประสบการณ์การแต่งตัวของคุณ
          </p>
          <div className="text-sm text-gray-400">
            <p>Launch Date: August 2025</p>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2"></div>
          </div>
        </div>
      </section>

      {/* Collection Sections */}
      {collections.map((collection, index) => (
        <section key={index} className="py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            
            {/* Image Section */}
            <div className={`${index % 2 === 0 ? 'lg:order-1' : 'lg:order-2'} bg-gradient-to-br ${collection.color} flex items-center justify-center p-8 lg:p-12`}>
              <div className="w-full max-w-md aspect-square">
                <img
                  src={collection.img}
                  alt={collection.title}
                  className="w-full h-full object-cover rounded-2xl shadow-2xl hover:scale-105 transition-transform duration-700"
                  onError={(e) =>
                    (e.target.src =
                      `https://via.placeholder.com/600x600/${index === 0 ? 'dbeafe/3b82f6' : index === 1 ? 'f3f4f6/6b7280' : 'dcfce7/22c55e'}?text=${collection.title}`)
                  }
                />
              </div>
            </div>

            {/* Content Section */}
            <div className={`${index % 2 === 0 ? 'lg:order-2' : 'lg:order-1'} flex items-center justify-center p-8 lg:p-12`}>
              <div className="max-w-md">
                <p className="text-sm uppercase tracking-[0.2em] text-gray-500 mb-3">
                  {collection.subtitle}
                </p>
                
                <h2 className="text-3xl lg:text-4xl font-light text-black mb-4 leading-tight">
                  {collection.title}
                </h2>
                
                <p className="text-base text-gray-600 mb-6 leading-relaxed">
                  {collection.description}
                </p>
                
                {/* Features */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-black mb-3 uppercase tracking-wider">
                    Key Features
                  </h3>
                  <ul className="space-y-2">
                    {collection.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-gray-700 text-sm">
                        <div className="w-1.5 h-1.5 bg-black rounded-full mr-3"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* CTA Button */}
                <button className="group relative overflow-hidden bg-black text-white px-8 py-3 text-sm font-medium uppercase tracking-wider hover:bg-gray-800 transition-all duration-300">
                  <span className="relative z-10">Notify Me</span>
                  <div className="absolute inset-0 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                  <span className="absolute inset-0 flex items-center justify-center text-black opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-medium uppercase tracking-wider text-sm">
                    Notify Me
                  </span>
                </button>
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* Footer CTA */}
      <section className="py-20 bg-black text-white text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-2xl lg:text-3xl font-light mb-4">
            Be the first to experience
          </h2>
          <p className="text-gray-300 text-base mb-8 leading-relaxed">
            Join our exclusive launch list and get early access to the New Collection
            plus 15% off your first order.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 bg-transparent border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-white transition-colors text-sm"
            />
            <button className="px-8 py-3 bg-white text-black font-medium uppercase tracking-wider hover:bg-gray-100 transition-colors text-sm">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}