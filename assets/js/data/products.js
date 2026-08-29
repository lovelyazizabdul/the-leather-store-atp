/* ==========================================================================
   The Leather Store — products.js
   Catalog data. Categories + products. Edit freely — the whole site is
   rendered from this file.

   Product shorthand keys:
     c  category id      n  name              p  price (number)
     m  MRP / strike-through price            g  gender
     mt material         st style             cl colours (array)
     sz sizes (array)    d  description       f  feature bullets (array)
     r  rating           s  in stock (bool, default true)
     b  bestseller (bool)                     nw new arrival (bool)
     ex extra attributes ({shape, movement, family, concentration, capacity})
     images / video      optional real media (see README)
   ========================================================================== */
(function (global) {
  "use strict";

  var TLS = (global.TLS = global.TLS || {});

  /* ---------- Colour swatch reference ---------- */
  var COLOR_HEX = {
    Black: "#1c1c1c",
    Brown: "#6b4423",
    Tan: "#c08552",
    Cognac: "#9a5b2b",
    Burgundy: "#6d2233",
    Maroon: "#5a1f2b",
    Navy: "#1f3050",
    Blue: "#2f5d9e",
    White: "#f4f1ea",
    Ivory: "#f7f1e8",
    Cream: "#efe3cf",
    Beige: "#d9c8a9",
    Grey: "#8a8a8a",
    Gunmetal: "#4a4e54",
    Olive: "#5c6142",
    Green: "#2f5d50",
    Red: "#9b2226",
    Rust: "#8c4a2f",
    Amber: "#c98b2e",
    Pink: "#d99aa6",
    Gold: "#b8873b",
    Silver: "#c3c7cb",
    "Rose Gold": "#c9938a",
    Tortoise: "#7a4a22"
  };

  /* ---------- Categories ---------- */
  var CATEGORIES = [
    {
      id: "shoes",
      name: "Shoes",
      singular: "Shoe",
      tagline: "Formal & casual leather footwear",
      blurb:
        "Goodyear-welted oxfords, hand-burnished brogues and everyday loafers — built on lasts that respect the shape of a real foot.",
      facets: ["sizes", "colors", "gender", "material", "style"]
    },
    {
      id: "sandals",
      name: "Sandals",
      singular: "Sandal",
      tagline: "Breathable comfort, all-day wear",
      blurb:
        "From heritage Kolhapuris to cushioned sport slides — vegetable-tanned leather that softens beautifully with every wear.",
      facets: ["sizes", "colors", "gender", "material", "style"]
    },
    {
      id: "sneakers",
      name: "Sneakers",
      singular: "Sneaker",
      tagline: "Street-ready silhouettes",
      blurb:
        "Court classics, knitted runners and rugged trail profiles — cushioned midsoles, premium uppers, zero break-in pain.",
      facets: ["sizes", "colors", "gender", "material", "style"]
    },
    {
      id: "sunglasses",
      name: "Sun Glasses",
      singular: "Sunglasses",
      tagline: "UV400 protection with real presence",
      blurb:
        "Polarised and gradient lenses set in acetate, titanium and surgical-steel frames. Every pair fitted in store, free of charge.",
      facets: ["colors", "gender", "shape", "material", "lens"]
    },
    {
      id: "watches",
      name: "Wrist Watches",
      singular: "Watch",
      tagline: "Mechanical & quartz timepieces",
      blurb:
        "Automatics with exhibition case-backs, slim quartz dress watches and dive-ready tool watches — each regulated before it leaves us.",
      facets: ["colors", "gender", "movement", "strap", "style"]
    },
    {
      id: "handbags",
      name: "Ladies Handbags",
      singular: "Handbag",
      tagline: "Structure, softness and space",
      blurb:
        "Saffiano totes, quilted lambskin crossbodies and suede buckets — lined, reinforced and finished with solid brass hardware.",
      facets: ["colors", "sizes", "material", "style"]
    },
    {
      id: "wallets",
      name: "Gents Wallets",
      singular: "Wallet",
      tagline: "Slim, strong, RFID-safe",
      blurb:
        "Full-grain bifolds, minimalist card holders and zip organisers — saddle-stitched by hand and edge-painted to last decades.",
      facets: ["colors", "material", "style"]
    },
    {
      id: "travel-bags",
      name: "Travel Bags",
      singular: "Travel Bag",
      tagline: "Cabin-friendly to long-haul",
      blurb:
        "Waxed-canvas duffels, ballistic-nylon backpacks and polycarbonate trolleys — YKK zips and reinforced stress points throughout.",
      facets: ["colors", "sizes", "material", "style"]
    },
    {
      id: "perfumes",
      name: "Perfumes",
      singular: "Perfume",
      tagline: "Long-wear eau de parfum",
      blurb:
        "Oud, amber, citrus and gourmand compositions with 18–24% concentration — sampled in store before you commit.",
      facets: ["gender", "sizes", "family", "concentration"]
    }
  ];

  /* ---------- Facet labels ---------- */
  var FACET_LABELS = {
    sizes: "Size",
    colors: "Colour",
    gender: "Gender",
    material: "Material",
    style: "Style",
    shape: "Frame Shape",
    lens: "Lens",
    movement: "Movement",
    strap: "Strap",
    family: "Fragrance Family",
    concentration: "Concentration"
  };

  /* Facets rendered as pills instead of checkboxes */
  var PILL_FACETS = { sizes: true };

  var SHOE_SZ = ["UK 5", "UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11"];
  var SHOE_SZ_W = ["UK 3", "UK 4", "UK 5", "UK 6", "UK 7", "UK 8"];
  var BAG_SZ = ["Small", "Medium", "Large"];

  /* ---------- Products ---------- */
  var RAW = [
    /* ============================ SHOES ============================ */
    { c: "shoes", n: "Wexford Cap-Toe Oxford", p: 5499, m: 7999, g: "Men", mt: "Full-Grain Leather", st: "Formal", cl: ["Black", "Cognac"], sz: SHOE_SZ, r: 4.8, b: true,
      d: "A closed-lacing oxford with a crisp cap toe, built on a slim last that flatters a suit without pinching. Blake-stitched sole, leather-lined footbed and a hand-burnished finish that deepens with polish.",
      f: ["Blake-stitched leather sole", "Full leather lining and sock", "Hand-burnished toe and heel", "Comes with shoe bag and horn"] },
    { c: "shoes", n: "Ashford Wingtip Brogue", p: 6299, m: 8499, g: "Men", mt: "Calf Leather", st: "Formal", cl: ["Brown", "Burgundy"], sz: SHOE_SZ, r: 4.7, b: true,
      d: "Full brogue detailing across a W-shaped wingtip, punched by hand. The oak-tanned leather sole is stacked over a cork bed that moulds to your footprint within a week." },
    { c: "shoes", n: "Camden Penny Loafer", p: 4899, m: 6499, g: "Men", mt: "Suede", st: "Casual", cl: ["Tan", "Navy"], sz: SHOE_SZ, r: 4.6, nw: true,
      d: "Unlined suede loafer with a hand-sewn apron and a flexible rubber wedge. Light enough for travel, smart enough for Friday meetings." },
    { c: "shoes", n: "Marlowe Derby", p: 5799, m: 7499, g: "Men", mt: "Full-Grain Leather", st: "Formal", cl: ["Black", "Brown"], sz: SHOE_SZ, r: 4.7,
      d: "Open-lacing derby with a roomier fit through the instep — the practical alternative to an oxford for wider feet and long days." },
    { c: "shoes", n: "Aveline Block-Heel Pump", p: 4599, m: 5999, g: "Women", mt: "Nappa Leather", st: "Formal", cl: ["Black", "Maroon"], sz: SHOE_SZ_W, r: 4.6,
      d: "A 55 mm block heel balanced over a cushioned latex insole, so it walks like a flat and reads like a heel." },
    { c: "shoes", n: "Rosalind Ballet Flat", p: 2999, m: 3999, g: "Women", mt: "Soft Leather", st: "Casual", cl: ["Beige", "Black", "Tan"], sz: SHOE_SZ_W, r: 4.5, b: true,
      d: "Feather-light nappa flat with an elasticated topline that hugs without gaping. Folds flat into a handbag for the commute." },
    { c: "shoes", n: "Halden Chelsea Boot", p: 7499, m: 9999, g: "Men", mt: "Oiled Leather", st: "Boots", cl: ["Brown", "Black"], sz: SHOE_SZ, r: 4.9, b: true,
      d: "Twin-gusset Chelsea in oiled pull-up leather that scuffs into character rather than damage. Commando rubber sole for monsoon grip." },
    { c: "shoes", n: "Seraphine Ankle Boot", p: 6999, m: 8999, g: "Women", mt: "Suede", st: "Boots", cl: ["Olive", "Black"], sz: SHOE_SZ_W, r: 4.7, nw: true,
      d: "A clean-shafted suede boot on a stacked 45 mm heel with a concealed side zip — the quiet workhorse of a winter wardrobe." },

    /* ============================ SANDALS ============================ */
    { c: "sandals", n: "Kolhapuri Heritage Sandal", p: 1899, m: 2499, g: "Unisex", mt: "Vegetable-Tanned Leather", st: "Ethnic", cl: ["Tan", "Brown"], sz: SHOE_SZ, r: 4.8, b: true,
      d: "Made by third-generation artisans in Kolhapur using no nails and no synthetic glue — only braided leather and vegetable tanning that takes 28 days.",
      f: ["Hand-braided, nail-free construction", "Vegetable-tanned in the traditional pit method", "Moulds to your foot in about a week", "Every pair is slightly unique"] },
    { c: "sandals", n: "Dune Double-Strap Slide", p: 1599, m: 2199, g: "Men", mt: "Buffalo Leather", st: "Casual", cl: ["Brown", "Black"], sz: SHOE_SZ, r: 4.4,
      d: "Two adjustable buffalo-leather straps over a contoured EVA footbed. The slide you will reach for from April to October." },
    { c: "sandals", n: "Trailhead Sport Sandal", p: 2399, m: 2999, g: "Men", mt: "Nubuck & Webbing", st: "Outdoor", cl: ["Olive", "Black"], sz: SHOE_SZ, r: 4.5,
      d: "Quick-dry webbing, a nubuck heel cradle and a lugged outsole rated for river crossings and rough trails." },
    { c: "sandals", n: "Marina Braided Slide", p: 1799, m: 2399, g: "Women", mt: "Soft Leather", st: "Casual", cl: ["Tan", "White"], sz: SHOE_SZ_W, r: 4.6, nw: true,
      d: "A wide braided vamp in glove-soft leather over a memory-foam footbed — holiday-ready, city-appropriate." },
    { c: "sandals", n: "Lagoon Toe-Ring Flat", p: 1499, m: 1999, g: "Women", mt: "Metallic Leather", st: "Ethnic", cl: ["Gold", "Silver"], sz: SHOE_SZ_W, r: 4.3,
      d: "Featherweight metallic toe-ring flat with a padded sole — designed for long wedding evenings on hard floors." },
    { c: "sandals", n: "Sierra Fisherman Sandal", p: 2599, m: 3299, g: "Men", mt: "Full-Grain Leather", st: "Casual", cl: ["Cognac"], sz: SHOE_SZ, r: 4.6,
      d: "Woven closed-toe fisherman in full-grain leather with an adjustable ankle buckle and a stitched-down rubber sole." },
    { c: "sandals", n: "Bloom Wedge Sandal", p: 2899, m: 3699, g: "Women", mt: "Nappa Leather", st: "Party", cl: ["Black", "Rose Gold"], sz: SHOE_SZ_W, r: 4.5,
      d: "A 70 mm cork wedge that carries the weight for you, topped with delicate nappa straps and a secure ankle latch." },
    { c: "sandals", n: "Coast Everyday Slipper", p: 1299, m: 1699, g: "Unisex", mt: "EVA & Leather", st: "Casual", cl: ["Navy", "Grey"], sz: SHOE_SZ, r: 4.2,
      d: "The house slipper that survives the pavement — waterproof EVA base, leather strap, anti-slip tread." },

    /* ============================ SNEAKERS ============================ */
    { c: "sneakers", n: "Court Classic Low", p: 3499, m: 4499, g: "Unisex", mt: "Leather", st: "Court", cl: ["White", "Black"], sz: SHOE_SZ, r: 4.7, b: true,
      d: "The uncomplicated white leather court shoe — full-grain upper, vulcanised gum sole and a perforated toe box that actually breathes." },
    { c: "sneakers", n: "Runner Flex Knit", p: 3899, m: 4999, g: "Men", mt: "Engineered Knit", st: "Running", cl: ["Grey", "Navy"], sz: SHOE_SZ, r: 4.5,
      d: "A one-piece knit upper over a dual-density foam midsole. 268 g in a UK 9 — light enough to forget you are wearing them." },
    { c: "sneakers", n: "Retro Trainer 74", p: 4299, m: 5499, g: "Unisex", mt: "Suede & Leather", st: "Retro", cl: ["Cream", "Green"], sz: SHOE_SZ, r: 4.6, nw: true,
      d: "Suede overlays, a serrated T-toe and a gum wedge sole — a faithful reissue of a seventies terrace silhouette." },
    { c: "sneakers", n: "Skyline High-Top", p: 4699, m: 5999, g: "Men", mt: "Canvas & Leather", st: "High-Top", cl: ["Black", "Red"], sz: SHOE_SZ, r: 4.4,
      d: "Padded collar, leather toe cap and a reinforced eyestay — built for boards, worn everywhere else." },
    { c: "sneakers", n: "Cloudstep Slip-On", p: 2999, m: 3999, g: "Women", mt: "Stretch Knit", st: "Slip-On", cl: ["Pink", "White"], sz: SHOE_SZ_W, r: 4.6, b: true,
      d: "No laces, no fuss. A sock-fit knit collar over a springy foam base — machine washable at 30 °C." },
    { c: "sneakers", n: "Trail Grip Sneaker", p: 4999, m: 6499, g: "Men", mt: "Nubuck", st: "Outdoor", cl: ["Olive", "Rust"], sz: SHOE_SZ, r: 4.7,
      d: "Water-repellent nubuck, a gusseted tongue to keep grit out and a 4 mm lug outsole that bites on wet rock." },
    { c: "sneakers", n: "Metro Minimal", p: 3699, m: 4699, g: "Women", mt: "Leather", st: "Minimal", cl: ["Ivory", "Beige"], sz: SHOE_SZ_W, r: 4.5,
      d: "A stitch-free bonded leather upper with a hidden 25 mm wedge — quiet design with a discreet lift." },
    { c: "sneakers", n: "Velocity Pro", p: 5499, m: 6999, g: "Unisex", mt: "Engineered Mesh", st: "Running", cl: ["Blue", "Gunmetal"], sz: SHOE_SZ, r: 4.8, nw: true,
      d: "Carbon-infused plate, 8 mm drop and a rocker geometry that rolls you through the gait cycle. Built for tempo days." },

    /* ============================ SUNGLASSES ============================ */
    { c: "sunglasses", n: "Aviator Gold Classic", p: 2499, m: 3499, g: "Unisex", mt: "Metal", cl: ["Gold"], r: 4.8, b: true, ex: { shape: "Aviator", lens: "Polarised" },
      d: "The teardrop that started it all — gold-tone monel frame, double bridge and G15 polarised lenses that cut glare without dulling colour.",
      f: ["100% UV400 protection", "Polarised G15 lenses", "Adjustable silicone nose pads", "Hard case, cloth and card included"] },
    { c: "sunglasses", n: "Wayfarer Matte Black", p: 2199, m: 2999, g: "Unisex", mt: "Acetate", cl: ["Black"], r: 4.7, b: true, ex: { shape: "Wayfarer", lens: "UV400" },
      d: "Hand-polished Italian acetate with reinforced metal core hinges. The frame that suits almost every face shape." },
    { c: "sunglasses", n: "Cateye Blush", p: 1999, m: 2699, g: "Women", mt: "Acetate", cl: ["Pink", "Rose Gold"], r: 4.6, nw: true, ex: { shape: "Cat-Eye", lens: "Gradient" },
      d: "A softly upswept cat-eye in blush acetate with rose-gold temple tips and a smoke gradient lens." },
    { c: "sunglasses", n: "Round Heritage", p: 2299, m: 2999, g: "Unisex", mt: "Metal", cl: ["Gunmetal"], r: 4.5, ex: { shape: "Round", lens: "Polarised" },
      d: "Slim wire rims, a keyhole bridge and flat polarised lenses — literary, not costume." },
    { c: "sunglasses", n: "Sport Wrap Shield", p: 2799, m: 3599, g: "Men", mt: "TR90", cl: ["Blue", "Black"], r: 4.6, ex: { shape: "Wrap", lens: "Polarised" },
      d: "An 8-base wrap in unbreakable TR90 with hydrophilic rubber temples that grip harder as you sweat." },
    { c: "sunglasses", n: "Clubmaster Tortoise", p: 2599, m: 3299, g: "Unisex", mt: "Acetate & Metal", cl: ["Tortoise", "Amber"], r: 4.7, ex: { shape: "Clubmaster", lens: "UV400" },
      d: "Browline acetate over a wire lower rim, in a hand-laid tortoise pattern where no two frames match exactly." },
    { c: "sunglasses", n: "Oversized Square Noir", p: 2399, m: 3199, g: "Women", mt: "Acetate", cl: ["Black"], r: 4.5, ex: { shape: "Square", lens: "Gradient" },
      d: "Generous square lenses with a graduated smoke tint — full coverage without the bug-eye." },
    { c: "sunglasses", n: "Titanium Rimless", p: 3499, m: 4499, g: "Men", mt: "Titanium", cl: ["Silver"], r: 4.8, nw: true, ex: { shape: "Rimless", lens: "Polarised" },
      d: "Beta-titanium rimless build at just 18 g, with screwless flex hinges and a polarised grey lens." },

    /* ============================ WATCHES ============================ */
    { c: "watches", n: "Heritage Automatic 39", p: 12999, m: 16999, g: "Men", mt: "Stainless Steel", st: "Dress", cl: ["Brown", "Cream"], r: 4.9, b: true,
      ex: { movement: "Automatic", strap: "Leather Strap" },
      d: "A 39 mm sector-dial automatic with an exhibition case-back over a 21-jewel movement and a 40-hour power reserve.",
      f: ["21-jewel automatic movement", "40-hour power reserve", "Sapphire-coated mineral crystal", "5 ATM water resistance", "2-year international warranty"] },
    { c: "watches", n: "Chrono Sport 42", p: 8999, m: 11999, g: "Men", mt: "Stainless Steel", st: "Sport", cl: ["Silver", "Black"], r: 4.6, b: true,
      ex: { movement: "Quartz Chronograph", strap: "Steel Bracelet" },
      d: "Three-register chronograph with a tachymeter bezel, luminous indices and a solid-link bracelet with a micro-adjust clasp." },
    { c: "watches", n: "Minimal Slim 38", p: 4999, m: 6999, g: "Unisex", mt: "Stainless Steel", st: "Dress", cl: ["Black"], r: 4.5,
      ex: { movement: "Quartz", strap: "Leather Strap" },
      d: "6.8 mm thin, no date window, no clutter. A matte-black dial with applied batons and a full-grain strap." },
    { c: "watches", n: "Rose Petite 32", p: 5999, m: 7999, g: "Women", mt: "Stainless Steel", st: "Dress", cl: ["Rose Gold"], r: 4.7, nw: true,
      ex: { movement: "Quartz", strap: "Mesh Bracelet" },
      d: "A 32 mm rose-gold case on a Milanese mesh bracelet with an infinitely adjustable magnetic clasp." },
    { c: "watches", n: "Diver 200M", p: 14999, m: 18999, g: "Men", mt: "Stainless Steel", st: "Sport", cl: ["Navy", "Silver"], r: 4.9,
      ex: { movement: "Automatic", strap: "Steel Bracelet" },
      d: "200 m rated with a 120-click unidirectional bezel, screw-down crown and Super-LumiNova on hands and pip." },
    { c: "watches", n: "Skeleton Open-Heart", p: 11499, m: 14999, g: "Men", mt: "Stainless Steel", st: "Dress", cl: ["Gunmetal"], r: 4.6,
      ex: { movement: "Automatic", strap: "Leather Strap" },
      d: "An open-heart aperture at 9 o'clock reveals the balance wheel breathing at 21,600 vph." },
    { c: "watches", n: "Bangle Jewel 28", p: 6499, m: 8499, g: "Women", mt: "Gold-Tone Alloy", st: "Jewellery", cl: ["Gold"], r: 4.4,
      ex: { movement: "Quartz", strap: "Bangle" },
      d: "Half timepiece, half cuff — a hinged bangle with a 28 mm mother-of-pearl dial and hand-set crystals." },
    { c: "watches", n: "Digital Trail", p: 3999, m: 5499, g: "Unisex", mt: "Resin", st: "Sport", cl: ["Olive"], r: 4.3,
      ex: { movement: "Digital", strap: "Silicone" },
      d: "Backlit negative LCD, dual time, stopwatch and a 10 ATM resin case that shrugs off drops." },

    /* ============================ HANDBAGS ============================ */
    { c: "handbags", n: "Milano Structured Tote", p: 4999, m: 6999, g: "Women", mt: "Saffiano Leather", st: "Tote", cl: ["Tan", "Black"], sz: ["Large"], r: 4.8, b: true,
      d: "A scratch-resistant Saffiano tote that stands up on its own, with a padded 14-inch laptop sleeve hidden behind the main compartment.",
      f: ["Fits a 14-inch laptop", "Padded, lined laptop sleeve", "Solid brass feet and hardware", "Detachable shoulder strap", "Dust bag included"] },
    { c: "handbags", n: "Aurora Sling", p: 2999, m: 3999, g: "Women", mt: "Nappa Leather", st: "Sling", cl: ["Maroon", "Black"], sz: ["Small"], r: 4.6, b: true,
      d: "A compact sling sized for a phone, a card case and a lipstick — with an adjustable strap that converts to a belt bag." },
    { c: "handbags", n: "Vienna Satchel", p: 5499, m: 7499, g: "Women", mt: "Full-Grain Leather", st: "Satchel", cl: ["Cognac", "Navy"], sz: ["Medium"], r: 4.7,
      d: "Twin buckle closures over a three-compartment interior, on a top handle plus a detachable crossbody strap." },
    { c: "handbags", n: "Petal Quilted Crossbody", p: 3499, m: 4599, g: "Women", mt: "Lambskin", st: "Crossbody", cl: ["Cream", "Pink"], sz: ["Small"], r: 4.7, nw: true,
      d: "Diamond-quilted lambskin on a gold-tone chain that can be doubled for a shoulder carry." },
    { c: "handbags", n: "Luna Bucket Bag", p: 3999, m: 5299, g: "Women", mt: "Suede", st: "Bucket", cl: ["Beige", "Olive"], sz: ["Medium"], r: 4.5,
      d: "A drawstring bucket in brushed suede with a removable zip pouch that clips inside to stop the abyss effect." },
    { c: "handbags", n: "Opera Clutch", p: 2499, m: 3299, g: "Women", mt: "Satin & Leather", st: "Clutch", cl: ["Gold", "Black"], sz: ["Small"], r: 4.4,
      d: "An evening clutch with a concealed chain, so it becomes a shoulder bag the moment the dancing starts." },
    { c: "handbags", n: "Metro Work Tote", p: 6499, m: 8499, g: "Women", mt: "Vegan Leather", st: "Work", cl: ["Grey", "Black"], sz: ["Large"], r: 4.6,
      d: "A vegan-leather work tote with a trolley sleeve, six card slots and a bottle pocket that keeps a leak away from paperwork." },
    { c: "handbags", n: "Sierra Hobo", p: 4299, m: 5599, g: "Women", mt: "Pebbled Leather", st: "Hobo", cl: ["Brown", "Rust"], sz: ["Medium"], r: 4.5,
      d: "A slouchy pebbled hobo that sits close under the arm, with a wide shoulder strap that does not dig in." },

    /* ============================ WALLETS ============================ */
    { c: "wallets", n: "Classic Bifold", p: 1499, m: 1999, g: "Men", mt: "Full-Grain Leather", st: "Bifold", cl: ["Black", "Brown"], r: 4.8, b: true,
      d: "Eight card slots, two note sleeves and a hidden pocket, saddle-stitched with waxed linen thread that outlives machine stitching.",
      f: ["RFID-blocking lining", "Hand saddle-stitched with waxed thread", "Hand-painted edges", "Free monogramming in store"] },
    { c: "wallets", n: "Slim Cardholder", p: 999, m: 1399, g: "Men", mt: "Calf Leather", st: "Cardholder", cl: ["Tan", "Black"], r: 4.7, b: true,
      d: "Four slots and a centre pocket in a 4 mm profile — the antidote to a back-pocket brick." },
    { c: "wallets", n: "RFID Trifold", p: 1799, m: 2399, g: "Men", mt: "Buffalo Leather", st: "Trifold", cl: ["Brown"], r: 4.5,
      d: "Twelve card slots, a clear ID window and a full-length coin pouch, all shielded by an RFID-blocking membrane." },
    { c: "wallets", n: "Long Zip Organiser", p: 2299, m: 2999, g: "Men", mt: "Full-Grain Leather", st: "Zip Wallet", cl: ["Cognac", "Black"], r: 4.6,
      d: "A travel-sized zip-around that swallows a passport, boarding passes and two currencies without bulging." },
    { c: "wallets", n: "Money Clip Wallet", p: 1299, m: 1799, g: "Men", mt: "Calf Leather", st: "Money Clip", cl: ["Gunmetal", "Black"], r: 4.4,
      d: "A sprung steel clip riveted into calf leather, with three card slots on the reverse." },
    { c: "wallets", n: "Passport Travel Wallet", p: 2499, m: 3199, g: "Men", mt: "Vegetable-Tanned Leather", st: "Travel", cl: ["Tan"], r: 4.7, nw: true,
      d: "Holds two passports, boarding cards, a pen and a SIM tool — in leather that patinas like a well-used journal." },
    { c: "wallets", n: "Executive Gift Set", p: 2999, m: 3999, g: "Men", mt: "Full-Grain Leather", st: "Gift Set", cl: ["Black", "Brown"], r: 4.8,
      d: "A matched bifold and reversible belt in a rigid presentation box — our most-gifted set every Diwali." },
    { c: "wallets", n: "Vintage Hunter Bifold", p: 1899, m: 2499, g: "Men", mt: "Crazy-Horse Leather", st: "Bifold", cl: ["Rust"], r: 4.6,
      d: "Waxed crazy-horse leather that lightens where it bends — every scuff becomes part of the finish." },

    /* ============================ TRAVEL BAGS ============================ */
    { c: "travel-bags", n: "Voyager Cabin Duffel 40L", p: 4999, m: 6499, g: "Unisex", mt: "Waxed Canvas & Leather", st: "Duffel", cl: ["Olive", "Brown"], sz: ["Cabin"], r: 4.8, b: true,
      d: "Sized to the strictest cabin allowance, in 18 oz waxed canvas with full-grain leather ends and a YKK #10 zip.",
      f: ["Cabin-compliant 40 L capacity", "18 oz water-resistant waxed canvas", "YKK #10 self-repairing zip", "Detachable padded shoulder strap", "Trolley pass-through sleeve"] },
    { c: "travel-bags", n: "Continental Weekender 55L", p: 6499, m: 8499, g: "Unisex", mt: "Full-Grain Leather", st: "Weekender", cl: ["Cognac", "Black"], sz: ["Large"], r: 4.9,
      d: "A three-day bag in a single hide, with a shoe compartment at the base and brass feet that keep the leather off the floor." },
    { c: "travel-bags", n: "Trekker Backpack 35L", p: 3999, m: 5299, g: "Unisex", mt: "Ballistic Nylon", st: "Backpack", cl: ["Grey", "Navy"], sz: ["Medium"], r: 4.6, b: true,
      d: "1680D ballistic nylon, a ventilated back panel and a clamshell opening that makes airport security painless." },
    { c: "travel-bags", n: "Executive Laptop Briefcase", p: 5499, m: 7299, g: "Men", mt: "Leather", st: "Briefcase", cl: ["Black", "Brown"], sz: ["Medium"], r: 4.7,
      d: "A structured 16-inch briefcase with a fleece-lined device bay, organiser panel and a removable shoulder strap." },
    { c: "travel-bags", n: "Trolley Cabin 55 cm", p: 7999, m: 9999, g: "Unisex", mt: "Polycarbonate", st: "Trolley", cl: ["Silver", "Navy"], sz: ["Cabin"], r: 4.5,
      d: "Virgin polycarbonate shell on eight silent spinner wheels, with a TSA lock and an expansion gusset for the way home." },
    { c: "travel-bags", n: "Garment Suit Carrier", p: 4599, m: 5999, g: "Men", mt: "Leather", st: "Garment", cl: ["Black"], sz: ["Large"], r: 4.6,
      d: "Carries two suits crease-free, then folds into a shoulder bag once you have hung them up." },
    { c: "travel-bags", n: "Explorer Rucksack 45L", p: 4299, m: 5499, g: "Unisex", mt: "Canvas", st: "Rucksack", cl: ["Beige", "Olive"], sz: ["Large"], r: 4.5, nw: true,
      d: "A roll-top canvas rucksack with leather compression straps and a padded hip belt for genuinely long carries." },
    { c: "travel-bags", n: "Gym & Travel Holdall 30L", p: 2999, m: 3899, g: "Unisex", mt: "Nylon & Leather", st: "Duffel", cl: ["Black", "Red"], sz: ["Small"], r: 4.4,
      d: "A ventilated shoe tunnel, a wet pocket and a wipe-clean base — built for the gym-to-airport double shift." },

    /* ============================ PERFUMES ============================ */
    { c: "perfumes", n: "Oud Noir", p: 3499, m: 4499, g: "Men", sz: ["100 ml"], cl: ["Black"], r: 4.8, b: true,
      ex: { family: "Woody Oriental", concentration: "Eau de Parfum" },
      d: "Cambodian oud over saffron and Bulgarian rose, dried down with patchouli and dark amber. Eight to ten hours of presence.",
      f: ["22% fragrance concentration", "8–10 hour longevity", "Arm's-length sillage", "Best for evening and cool weather", "Try before you buy, in store"] },
    { c: "perfumes", n: "Amber Rose", p: 2999, m: 3999, g: "Women", sz: ["50 ml"], cl: ["Rose Gold"], r: 4.7, b: true,
      ex: { family: "Floral Amber", concentration: "Eau de Parfum" },
      d: "Turkish rose absolute wrapped in warm amber and vanilla — romantic without ever tipping into sweet." },
    { c: "perfumes", n: "Citrus Marine", p: 2299, m: 2999, g: "Unisex", sz: ["100 ml"], cl: ["Blue"], r: 4.5,
      ex: { family: "Fresh Citrus", concentration: "Eau de Toilette" },
      d: "Calabrian bergamot and sea salt over a driftwood base. The summer-in-India answer to heavy fragrance." },
    { c: "perfumes", n: "Vanilla Musk", p: 2599, m: 3399, g: "Women", sz: ["50 ml"], cl: ["Cream"], r: 4.6,
      ex: { family: "Gourmand", concentration: "Eau de Parfum" },
      d: "Madagascan vanilla, tonka bean and white musk — a skin scent that people lean in to identify." },
    { c: "perfumes", n: "Leather & Tobacco", p: 3899, m: 4999, g: "Men", sz: ["100 ml"], cl: ["Brown"], r: 4.9, nw: true,
      ex: { family: "Leather", concentration: "Extrait de Parfum" },
      d: "Suede accord, pipe tobacco and dried fig, over a base of cade and vetiver. Our own house signature." },
    { c: "perfumes", n: "White Jasmine", p: 2799, m: 3599, g: "Women", sz: ["100 ml"], cl: ["Ivory"], r: 4.5,
      ex: { family: "Floral", concentration: "Eau de Parfum" },
      d: "Night-blooming jasmine sambac lifted with green mandarin and settled on sandalwood." },
    { c: "perfumes", n: "Sandal Santal", p: 3299, m: 4299, g: "Unisex", sz: ["50 ml"], cl: ["Tan"], r: 4.7,
      ex: { family: "Woody", concentration: "Eau de Parfum" },
      d: "Mysore-style sandalwood with cardamom and a whisper of iris — meditative, warm, unisex by design." },
    { c: "perfumes", n: "Aqua Sport", p: 1999, m: 2599, g: "Men", sz: ["100 ml"], cl: ["Blue"], r: 4.3,
      ex: { family: "Aquatic", concentration: "Eau de Toilette" },
      d: "Grapefruit, marine notes and cedar — the everyday office bottle that never offends a lift full of people." }
  ];

  /* ---------- Normalisation ---------- */
  function slugify(s) {
    return String(s)
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  var CAT_BY_ID = {};
  CATEGORIES.forEach(function (c) {
    c.slug = c.id;
    c.count = 0;
    CAT_BY_ID[c.id] = c;
  });

  var counters = {};

  var PRODUCTS = RAW.map(function (r) {
    var cat = CAT_BY_ID[r.c];
    if (!cat) throw new Error("Unknown category id: " + r.c);

    counters[r.c] = (counters[r.c] || 0) + 1;
    var seq = counters[r.c];

    var p = {
      id: slugify(r.n),
      sku:
        "TLS-" + r.c.slice(0, 3).toUpperCase() + "-" + String(seq).padStart(3, "0"),
      name: r.n,
      category: r.c,
      categoryName: cat.name,
      price: r.p,
      mrp: r.m || null,
      gender: r.g || "Unisex",
      material: r.mt || null,
      style: r.st || null,
      colors: r.cl || [],
      sizes: r.sz || [],
      rating: r.r || 4.5,
      reviews: 12 + ((seq * 17 + r.p) % 180),
      inStock: r.s !== false,
      bestseller: !!r.b,
      isNew: !!r.nw,
      images: r.images || null,
      video: r.video || null,
      description: r.d || "",
      features: r.f || null
    };

    if (r.ex) {
      Object.keys(r.ex).forEach(function (k) {
        p[k] = r.ex[k];
      });
    }

    p.discount = p.mrp && p.mrp > p.price ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0;

    if (!p.description) {
      p.description =
        p.name +
        " — finished in " +
        (p.material || "premium materials").toLowerCase() +
        " and quality-checked by hand before it reaches the shop floor.";
    }

    if (!p.features) {
      p.features = buildFeatures(p);
    }

    /* Short meta line shown on cards */
    p.meta = [p.material, p.style || p.shape || p.movement || p.family]
      .filter(Boolean)
      .join(" • ");

    cat.count++;
    return p;
  });

  function buildFeatures(p) {
    var f = [];
    if (p.material) f.push("Crafted in " + p.material.toLowerCase());
    if (p.sizes && p.sizes.length > 1) f.push("Available in " + p.sizes.length + " sizes");
    if (p.colors && p.colors.length > 1) f.push("Choose from " + p.colors.join(" or ").toLowerCase());
    switch (p.category) {
      case "shoes":
      case "sandals":
      case "sneakers":
        f.push("Cushioned, breathable footbed");
        f.push("Try both feet in store before you decide");
        break;
      case "sunglasses":
        f.push("100% UV400 protection");
        f.push("Free frame fitting and adjustment for life");
        break;
      case "watches":
        f.push("Battery or movement serviced in store");
        f.push("Free strap sizing on purchase");
        break;
      case "handbags":
        f.push("Fully lined with reinforced stress points");
        f.push("Dust bag included");
        break;
      case "wallets":
        f.push("RFID-blocking lining");
        f.push("Free monogramming in store");
        break;
      case "travel-bags":
        f.push("Reinforced base and bar-tacked handles");
        f.push("YKK zips throughout");
        break;
      case "perfumes":
        f.push("Sample it on skin before you buy");
        f.push("Sealed, batch-coded and 100% authentic");
        break;
      default:
        break;
    }
    f.push("1-year craftsmanship warranty");
    return f;
  }

  /* ---------- Hero carousel slides ---------- */
  var SLIDES = [
    {
      cat: "shoes",
      eyebrow: "Since 2009",
      title: "Leather that <em>remembers</em> you",
      text:
        "Hand-selected hides, hand-finished edges, and a fit our team checks in person. Fifteen years of getting the details right.",
      cta: { label: "Explore the collection", href: "categories.html" },
      cta2: { label: "Visit the store", href: "contact.html" }
    },
    {
      cat: "watches",
      eyebrow: "Wrist Watches",
      title: "Time, <em>properly</em> kept",
      text: "Swiss-grade automatics and slim quartz dress watches — each one regulated and strap-sized before you walk out.",
      cta: { label: "Shop watches", href: "category.html?cat=watches" }
    },
    {
      cat: "handbags",
      eyebrow: "Ladies Handbags",
      title: "Carry it with <em>intent</em>",
      text: "Saffiano totes, quilted lambskin crossbodies and suede buckets — structured to hold their shape for years.",
      cta: { label: "Shop handbags", href: "category.html?cat=handbags" }
    },
    {
      cat: "sneakers",
      eyebrow: "New Season",
      title: "Streets, <em>softened</em>",
      text: "Court classics and knitted runners with cushioning that survives an Indian city commute.",
      cta: { label: "Shop sneakers", href: "category.html?cat=sneakers" }
    },
    {
      cat: "perfumes",
      eyebrow: "Fragrance Bar",
      title: "A scent worth <em>remembering</em>",
      text: "Oud, amber and citrus compositions at 18–24% concentration. Sample every bottle on skin, in store.",
      cta: { label: "Shop perfumes", href: "category.html?cat=perfumes" }
    }
  ];

  /* ---------- Testimonials ---------- */
  var REVIEWS = [
    {
      text:
        "I have bought three pairs of shoes here over six years. The first pair has been resoled twice and still looks better than anything new I own.",
      name: "Anand Krishnan",
      note: "Customer since 2018",
      stars: 5
    },
    {
      text:
        "They spent forty minutes helping me choose a handbag and did not once try to upsell me. That is why I keep coming back with my friends.",
      name: "Priya Menon",
      note: "Customer since 2021",
      stars: 5
    },
    {
      text:
        "Bought a watch as a gift. They sized the bracelet, set the time, boxed it and refused to charge for any of it. Rare service.",
      name: "Vikram Shetty",
      note: "Customer since 2020",
      stars: 5
    }
  ];

  /* ---------- Exports ---------- */
  TLS.DATA = {
    COLOR_HEX: COLOR_HEX,
    CATEGORIES: CATEGORIES,
    FACET_LABELS: FACET_LABELS,
    PILL_FACETS: PILL_FACETS,
    PRODUCTS: PRODUCTS,
    SLIDES: SLIDES,
    REVIEWS: REVIEWS,

    category: function (id) {
      return CAT_BY_ID[id] || null;
    },
    byCategory: function (id) {
      return PRODUCTS.filter(function (p) {
        return p.category === id;
      });
    },
    product: function (id) {
      for (var i = 0; i < PRODUCTS.length; i++) {
        if (PRODUCTS[i].id === id) return PRODUCTS[i];
      }
      return null;
    },
    bestsellers: function (limit) {
      var list = PRODUCTS.filter(function (p) {
        return p.bestseller;
      });
      return limit ? list.slice(0, limit) : list;
    },
    newArrivals: function (limit) {
      var list = PRODUCTS.filter(function (p) {
        return p.isNew;
      });
      return limit ? list.slice(0, limit) : list;
    },
    priceRange: function (list) {
      var arr = list || PRODUCTS;
      var min = Infinity;
      var max = 0;
      arr.forEach(function (p) {
        if (p.price < min) min = p.price;
        if (p.price > max) max = p.price;
      });
      if (!isFinite(min)) min = 0;
      return { min: Math.floor(min / 100) * 100, max: Math.ceil(max / 100) * 100 };
    }
  };
})(window);
