/**
 * Category Templates — Initial presets for common product types.
 * 
 * ARCHITECTURE NOTE: These are stored locally for V1. The data structure
 * mirrors what will eventually be stored in Firestore under /categoryTemplates/{id}.
 * When admin-managed templates are built, this file becomes the seed data.
 */

import { CategoryTemplate } from '@/lib/types/schema';

export const categoryTemplates: CategoryTemplate[] = [
  {
    id: 'tshirt',
    name: 'T-Shirt',
    icon: 'FaTshirt',
    attributes: [
      { name: 'Size', values: ['S', 'M', 'L', 'XL', 'XXL'] },
      { name: 'Color', values: ['White', 'Black', 'Navy', 'Grey', 'Red'] },
    ],
    printAreas: [
      {
        id: 'front', label: 'Front',
        bounds: { x: 30, y: 20, width: 40, height: 35, rotation: 0 },
        maxUploadSizeBytes: 10485760, acceptedFileTypes: ['image/png', 'image/jpeg', 'image/svg+xml', 'application/pdf'],
        name: 'Default', productionMethods: ['DTG', 'DTF'], recommendedDpi: 300, lockAspectRatio: false, allowText: true, allowImages: true,
      },
      {
        id: 'back', label: 'Back',
        bounds: { x: 30, y: 20, width: 40, height: 35, rotation: 0 },
        maxUploadSizeBytes: 10485760, acceptedFileTypes: ['image/png', 'image/jpeg', 'image/svg+xml', 'application/pdf'],
        name: 'Default', productionMethods: ['DTG', 'DTF'], recommendedDpi: 300, lockAspectRatio: false, allowText: true, allowImages: true,
      },
      {
        id: 'left_sleeve', label: 'Left Sleeve',
        bounds: { x: 5, y: 25, width: 15, height: 10, rotation: 0 },
        maxUploadSizeBytes: 5242880, acceptedFileTypes: ['image/png', 'image/jpeg', 'image/svg+xml'],
        name: 'Default', productionMethods: ['DTG', 'DTF'], recommendedDpi: 300, lockAspectRatio: false, allowText: true, allowImages: true,
      },
      {
        id: 'right_sleeve', label: 'Right Sleeve',
        bounds: { x: 80, y: 25, width: 15, height: 10, rotation: 0 },
        maxUploadSizeBytes: 5242880, acceptedFileTypes: ['image/png', 'image/jpeg', 'image/svg+xml'],
        name: 'Default', productionMethods: ['DTG', 'DTF'], recommendedDpi: 300, lockAspectRatio: false, allowText: true, allowImages: true,
      },
      {
        id: 'neck_label', label: 'Neck Label',
        bounds: { x: 42, y: 8, width: 16, height: 5, rotation: 0 },
        maxUploadSizeBytes: 2097152, acceptedFileTypes: ['image/png', 'image/svg+xml'],
        name: 'Default', productionMethods: ['DTG', 'DTF'], recommendedDpi: 300, lockAspectRatio: true, allowText: true, allowImages: true,
      },
    ],
    defaultWeight: 180,
    seoTemplate: { title: '{name} — Custom Printed T-Shirt | F.S Print Works', description: 'Buy {name} from F.S Print Works. Premium quality custom printed t-shirt with vibrant colors.' },
    supportedCustomization: { allowImageUpload: true, allowTextPrinting: true, maxUploadSizeBytes: 10485760, acceptedFileTypes: ['image/png', 'image/jpeg', 'image/svg+xml', 'application/pdf'] },
    requiredImages: ['front', 'back'],
  },
  {
    id: 'oversized_tshirt',
    name: 'Oversized T-Shirt',
    icon: 'FaTshirt',
    attributes: [
      { name: 'Size', values: ['M', 'L', 'XL', 'XXL', 'XXXL'] },
      { name: 'Color', values: ['White', 'Black', 'Beige', 'Olive', 'Lavender'] },
    ],
    printAreas: [
      {
        id: 'front', label: 'Front',
        bounds: { x: 25, y: 18, width: 50, height: 40, rotation: 0 },
        maxUploadSizeBytes: 10485760, acceptedFileTypes: ['image/png', 'image/jpeg', 'image/svg+xml', 'application/pdf'],
        name: 'Default', productionMethods: ['DTG', 'DTF'], recommendedDpi: 300, lockAspectRatio: false, allowText: true, allowImages: true,
      },
      {
        id: 'back', label: 'Back',
        bounds: { x: 25, y: 18, width: 50, height: 40, rotation: 0 },
        maxUploadSizeBytes: 10485760, acceptedFileTypes: ['image/png', 'image/jpeg', 'image/svg+xml', 'application/pdf'],
        name: 'Default', productionMethods: ['DTG', 'DTF'], recommendedDpi: 300, lockAspectRatio: false, allowText: true, allowImages: true,
      },
    ],
    defaultWeight: 250,
    seoTemplate: { title: '{name} — Custom Oversized T-Shirt | F.S Print Works', description: 'Buy {name}. Oversized fit with premium custom printing.' },
    supportedCustomization: { allowImageUpload: true, allowTextPrinting: true, maxUploadSizeBytes: 10485760, acceptedFileTypes: ['image/png', 'image/jpeg', 'image/svg+xml', 'application/pdf'] },
    requiredImages: ['front', 'back'],
  },
  {
    id: 'hoodie',
    name: 'Hoodie',
    icon: 'FaTshirt',
    attributes: [
      { name: 'Size', values: ['S', 'M', 'L', 'XL', 'XXL'] },
      { name: 'Color', values: ['Black', 'Grey', 'Navy', 'White', 'Maroon'] },
    ],
    printAreas: [
      {
        id: 'front', label: 'Front',
        bounds: { x: 28, y: 30, width: 44, height: 30, rotation: 0 },
        maxUploadSizeBytes: 10485760, acceptedFileTypes: ['image/png', 'image/jpeg', 'image/svg+xml', 'application/pdf'],
        name: 'Default', productionMethods: ['DTG', 'DTF'], recommendedDpi: 300, lockAspectRatio: false, allowText: true, allowImages: true,
      },
      {
        id: 'back', label: 'Back',
        bounds: { x: 28, y: 25, width: 44, height: 35, rotation: 0 },
        maxUploadSizeBytes: 10485760, acceptedFileTypes: ['image/png', 'image/jpeg', 'image/svg+xml', 'application/pdf'],
        name: 'Default', productionMethods: ['DTG', 'DTF'], recommendedDpi: 300, lockAspectRatio: false, allowText: true, allowImages: true,
      },
      {
        id: 'pocket', label: 'Pocket',
        bounds: { x: 55, y: 35, width: 15, height: 12, rotation: 0 },
        maxUploadSizeBytes: 5242880, acceptedFileTypes: ['image/png', 'image/svg+xml'],
        name: 'Default', productionMethods: ['DTG', 'DTF'], recommendedDpi: 300, lockAspectRatio: false, allowText: true, allowImages: true,
      },
      {
        id: 'sleeve', label: 'Sleeve',
        bounds: { x: 5, y: 30, width: 15, height: 10, rotation: 0 },
        maxUploadSizeBytes: 5242880, acceptedFileTypes: ['image/png', 'image/svg+xml'],
        name: 'Default', productionMethods: ['DTG', 'DTF'], recommendedDpi: 300, lockAspectRatio: false, allowText: true, allowImages: true,
      },
      {
        id: 'hood', label: 'Hood',
        bounds: { x: 30, y: 2, width: 40, height: 15, rotation: 0 },
        maxUploadSizeBytes: 5242880, acceptedFileTypes: ['image/png', 'image/svg+xml'],
        name: 'Default', productionMethods: ['DTG', 'DTF'], recommendedDpi: 300, lockAspectRatio: false, allowText: false, allowImages: true,
      },
    ],
    defaultWeight: 320,
    seoTemplate: { title: '{name} — Custom Printed Hoodie | F.S Print Works', description: 'Buy {name}. Premium custom printed hoodie with soft fleece interior.' },
    supportedCustomization: { allowImageUpload: true, allowTextPrinting: true, maxUploadSizeBytes: 10485760, acceptedFileTypes: ['image/png', 'image/jpeg', 'image/svg+xml', 'application/pdf'] },
    requiredImages: ['front', 'back'],
  },
  {
    id: 'polo',
    name: 'Polo Shirt',
    icon: 'FaTshirt',
    attributes: [
      { name: 'Size', values: ['S', 'M', 'L', 'XL', 'XXL'] },
      { name: 'Color', values: ['White', 'Black', 'Navy', 'Red', 'Royal Blue'] },
    ],
    printAreas: [
      {
        id: 'front', label: 'Front',
        bounds: { x: 30, y: 25, width: 40, height: 30, rotation: 0 },
        maxUploadSizeBytes: 10485760, acceptedFileTypes: ['image/png', 'image/jpeg', 'image/svg+xml'],
        name: 'Default', productionMethods: ['DTG', 'DTF'], recommendedDpi: 300, lockAspectRatio: false, allowText: true, allowImages: true,
      },
      {
        id: 'back', label: 'Back',
        bounds: { x: 30, y: 20, width: 40, height: 35, rotation: 0 },
        maxUploadSizeBytes: 10485760, acceptedFileTypes: ['image/png', 'image/jpeg', 'image/svg+xml'],
        name: 'Default', productionMethods: ['DTG', 'DTF'], recommendedDpi: 300, lockAspectRatio: false, allowText: true, allowImages: true,
      },
    ],
    defaultWeight: 200,
    seoTemplate: { title: '{name} — Custom Polo Shirt | F.S Print Works', description: 'Buy {name}. Professional custom printed polo shirt.' },
    supportedCustomization: { allowImageUpload: true, allowTextPrinting: true, maxUploadSizeBytes: 10485760, acceptedFileTypes: ['image/png', 'image/jpeg', 'image/svg+xml'] },
    requiredImages: ['front'],
  },
  {
    id: 'cap',
    name: 'Cap',
    icon: 'FaTshirt',
    attributes: [
      { name: 'Style', values: ['Snapback', 'Dad Hat', 'Trucker', 'Fitted'] },
      { name: 'Color', values: ['Black', 'White', 'Navy', 'Red', 'Khaki'] },
    ],
    printAreas: [
      {
        id: 'front', label: 'Front Panel',
        bounds: { x: 25, y: 15, width: 50, height: 35, rotation: 0 },
        maxUploadSizeBytes: 5242880, acceptedFileTypes: ['image/png', 'image/svg+xml'],
        name: 'Default', productionMethods: ['DTG', 'DTF'], recommendedDpi: 300, lockAspectRatio: false, allowText: true, allowImages: true,
      },
      {
        id: 'side', label: 'Side',
        bounds: { x: 70, y: 30, width: 20, height: 15, rotation: 0 },
        maxUploadSizeBytes: 5242880, acceptedFileTypes: ['image/png', 'image/svg+xml'],
        name: 'Default', productionMethods: ['DTG', 'DTF'], recommendedDpi: 300, lockAspectRatio: false, allowText: true, allowImages: true,
      },
    ],
    defaultWeight: 80,
    seoTemplate: { title: '{name} — Custom Printed Cap | F.S Print Works', description: 'Buy {name}. Premium custom printed cap.' },
    supportedCustomization: { allowImageUpload: true, allowTextPrinting: true, maxUploadSizeBytes: 5242880, acceptedFileTypes: ['image/png', 'image/svg+xml'] },
    requiredImages: ['front'],
  },
  {
    id: 'mug',
    name: 'Mug',
    icon: 'FaMugHot',
    attributes: [
      { name: 'Capacity', values: ['325ml', '450ml', '600ml'] },
      { name: 'Color', values: ['White', 'Black', 'White (Inside Color)'] },
    ],
    printAreas: [
      {
        id: 'front', label: 'Front',
        bounds: { x: 15, y: 15, width: 35, height: 60, rotation: 0 },
        maxUploadSizeBytes: 10485760, acceptedFileTypes: ['image/png', 'image/jpeg', 'image/svg+xml'],
        name: 'Default', productionMethods: ['DTG', 'DTF'], recommendedDpi: 300, lockAspectRatio: false, allowText: true, allowImages: true,
      },
      {
        id: 'back', label: 'Back',
        bounds: { x: 50, y: 15, width: 35, height: 60, rotation: 0 },
        maxUploadSizeBytes: 10485760, acceptedFileTypes: ['image/png', 'image/jpeg', 'image/svg+xml'],
        name: 'Default', productionMethods: ['DTG', 'DTF'], recommendedDpi: 300, lockAspectRatio: false, allowText: true, allowImages: true,
      },
      {
        id: 'wrap', label: 'Full Wrap',
        bounds: { x: 5, y: 10, width: 90, height: 70, rotation: 0 },
        maxUploadSizeBytes: 15728640, acceptedFileTypes: ['image/png', 'image/jpeg', 'image/svg+xml', 'application/pdf'],
        name: 'Default', productionMethods: ['DTG', 'DTF'], recommendedDpi: 300, lockAspectRatio: false, allowText: true, allowImages: true,
      },
    ],
    defaultWeight: 350,
    seoTemplate: { title: '{name} — Custom Printed Mug | F.S Print Works', description: 'Buy {name}. Premium custom printed mug with vibrant colors.' },
    supportedCustomization: { allowImageUpload: true, allowTextPrinting: true, maxUploadSizeBytes: 10485760, acceptedFileTypes: ['image/png', 'image/jpeg', 'image/svg+xml'] },
    requiredImages: ['front'],
  },
  {
    id: 'bottle',
    name: 'Bottle',
    icon: 'FaCoffee',
    attributes: [
      { name: 'Capacity', values: ['500ml', '750ml', '1000ml'] },
      { name: 'Material', values: ['Stainless Steel', 'Plastic', 'Glass'] },
    ],
    printAreas: [
      {
        id: 'front', label: 'Front',
        bounds: { x: 20, y: 20, width: 30, height: 50, rotation: 0 },
        maxUploadSizeBytes: 10485760, acceptedFileTypes: ['image/png', 'image/jpeg', 'image/svg+xml'],
        name: 'Default', productionMethods: ['DTG', 'DTF'], recommendedDpi: 300, lockAspectRatio: false, allowText: true, allowImages: true,
      },
      {
        id: 'back', label: 'Back',
        bounds: { x: 50, y: 20, width: 30, height: 50, rotation: 0 },
        maxUploadSizeBytes: 10485760, acceptedFileTypes: ['image/png', 'image/jpeg', 'image/svg+xml'],
        name: 'Default', productionMethods: ['DTG', 'DTF'], recommendedDpi: 300, lockAspectRatio: false, allowText: true, allowImages: true,
      },
      {
        id: 'wrap', label: 'Full Wrap',
        bounds: { x: 5, y: 15, width: 90, height: 60, rotation: 0 },
        maxUploadSizeBytes: 15728640, acceptedFileTypes: ['image/png', 'image/jpeg', 'image/svg+xml', 'application/pdf'],
        name: 'Default', productionMethods: ['DTG', 'DTF'], recommendedDpi: 300, lockAspectRatio: false, allowText: true, allowImages: true,
      },
    ],
    defaultWeight: 200,
    seoTemplate: { title: '{name} — Custom Printed Bottle | F.S Print Works', description: 'Buy {name}. Custom printed bottle for everyday use.' },
    supportedCustomization: { allowImageUpload: true, allowTextPrinting: true, maxUploadSizeBytes: 10485760, acceptedFileTypes: ['image/png', 'image/jpeg', 'image/svg+xml'] },
    requiredImages: ['front'],
  },
  {
    id: 'keychain',
    name: 'Keychain',
    icon: 'FaKey',
    attributes: [
      { name: 'Shape', values: ['Rectangle', 'Circle', 'Heart', 'Custom'] },
      { name: 'Material', values: ['Acrylic', 'Metal', 'Wooden'] },
    ],
    printAreas: [
      {
        id: 'front', label: 'Front',
        bounds: { x: 10, y: 10, width: 80, height: 80, rotation: 0 },
        maxUploadSizeBytes: 5242880, acceptedFileTypes: ['image/png', 'image/jpeg', 'image/svg+xml'],
        name: 'Default', productionMethods: ['DTG', 'DTF'], recommendedDpi: 300, lockAspectRatio: true, allowText: true, allowImages: true,
      },
      {
        id: 'back', label: 'Back',
        bounds: { x: 10, y: 10, width: 80, height: 80, rotation: 0 },
        maxUploadSizeBytes: 5242880, acceptedFileTypes: ['image/png', 'image/jpeg', 'image/svg+xml'],
        name: 'Default', productionMethods: ['DTG', 'DTF'], recommendedDpi: 300, lockAspectRatio: true, allowText: true, allowImages: true,
      },
    ],
    defaultWeight: 30,
    seoTemplate: { title: '{name} — Custom Keychain | F.S Print Works', description: 'Buy {name}. Personalized custom keychain.' },
    supportedCustomization: { allowImageUpload: true, allowTextPrinting: true, maxUploadSizeBytes: 5242880, acceptedFileTypes: ['image/png', 'image/jpeg', 'image/svg+xml'] },
    requiredImages: ['front'],
  },
  {
    id: 'frame',
    name: 'Photo Frame',
    icon: 'FaImage',
    attributes: [
      { name: 'Size', values: ['4x6', '5x7', '8x10', 'A4', 'A3'] },
      { name: 'Material', values: ['Wooden', 'Acrylic', 'Metal'] },
    ],
    printAreas: [
      {
        id: 'front', label: 'Print Area',
        bounds: { x: 5, y: 5, width: 90, height: 90, rotation: 0 },
        maxUploadSizeBytes: 20971520, acceptedFileTypes: ['image/png', 'image/jpeg', 'image/svg+xml', 'application/pdf'],
        name: 'Default', productionMethods: ['DTG', 'DTF'], recommendedDpi: 300, lockAspectRatio: true, allowText: false, allowImages: true,
      },
    ],
    defaultWeight: 500,
    seoTemplate: { title: '{name} — Custom Photo Frame | F.S Print Works', description: 'Buy {name}. Personalized custom photo frame.' },
    supportedCustomization: { allowImageUpload: true, allowTextPrinting: false, maxUploadSizeBytes: 20971520, acceptedFileTypes: ['image/png', 'image/jpeg', 'application/pdf'] },
    requiredImages: ['front'],
  },
  {
    id: 'sticker',
    name: 'Sticker',
    icon: 'FaTags',
    attributes: [
      { name: 'Size', values: ['2x2 inch', '3x3 inch', '4x4 inch', 'A5', 'A4'] },
      { name: 'Finish', values: ['Glossy', 'Matte', 'Holographic'] },
    ],
    printAreas: [
      {
        id: 'front', label: 'Print Area',
        bounds: { x: 5, y: 5, width: 90, height: 90, rotation: 0 },
        maxUploadSizeBytes: 10485760, acceptedFileTypes: ['image/png', 'image/svg+xml', 'application/pdf', 'application/illustrator'],
        name: 'Default', productionMethods: ['DTG', 'DTF'], recommendedDpi: 300, lockAspectRatio: false, allowText: true, allowImages: true,
      },
    ],
    defaultWeight: 10,
    seoTemplate: { title: '{name} — Custom Sticker | F.S Print Works', description: 'Buy {name}. High-quality custom printed sticker.' },
    supportedCustomization: { allowImageUpload: true, allowTextPrinting: true, maxUploadSizeBytes: 10485760, acceptedFileTypes: ['image/png', 'image/svg+xml', 'application/pdf'] },
    requiredImages: ['front'],
  },
  {
    id: 'mousepad',
    name: 'Mousepad',
    icon: 'FaMobileAlt',
    attributes: [
      { name: 'Size', values: ['Standard', 'Large', 'XXL Desk Mat'] },
      { name: 'Edge', values: ['Standard', 'Stitched Edge'] },
    ],
    printAreas: [
      {
        id: 'front', label: 'Top Surface',
        bounds: { x: 2, y: 2, width: 96, height: 96, rotation: 0 },
        maxUploadSizeBytes: 15728640, acceptedFileTypes: ['image/png', 'image/jpeg', 'image/svg+xml', 'application/pdf'],
        name: 'Default', productionMethods: ['DTG', 'DTF'], recommendedDpi: 300, lockAspectRatio: false, allowText: true, allowImages: true,
      },
    ],
    defaultWeight: 150,
    seoTemplate: { title: '{name} — Custom Mousepad | F.S Print Works', description: 'Buy {name}. Custom printed mousepad with smooth surface.' },
    supportedCustomization: { allowImageUpload: true, allowTextPrinting: true, maxUploadSizeBytes: 15728640, acceptedFileTypes: ['image/png', 'image/jpeg', 'image/svg+xml', 'application/pdf'] },
    requiredImages: ['front'],
  },
  {
    id: 'visiting_card',
    name: 'Visiting Card',
    icon: 'FaTags',
    attributes: [
      { name: 'Paper', values: ['300 GSM', '350 GSM', '400 GSM'] },
      { name: 'Finish', values: ['Matte', 'Glossy', 'Matte Laminated', 'Spot UV'] },
    ],
    printAreas: [
      {
        id: 'front', label: 'Front',
        bounds: { x: 3, y: 3, width: 94, height: 94, rotation: 0 },
        maxUploadSizeBytes: 10485760, acceptedFileTypes: ['image/png', 'image/jpeg', 'application/pdf', 'application/illustrator'],
        name: 'Default', productionMethods: ['DTG', 'DTF'], recommendedDpi: 300, lockAspectRatio: true, allowText: true, allowImages: true,
      },
      {
        id: 'back', label: 'Back',
        bounds: { x: 3, y: 3, width: 94, height: 94, rotation: 0 },
        maxUploadSizeBytes: 10485760, acceptedFileTypes: ['image/png', 'image/jpeg', 'application/pdf', 'application/illustrator'],
        name: 'Default', productionMethods: ['DTG', 'DTF'], recommendedDpi: 300, lockAspectRatio: true, allowText: true, allowImages: true,
      },
    ],
    defaultWeight: 5,
    seoTemplate: { title: '{name} — Custom Visiting Card | F.S Print Works', description: 'Buy {name}. Premium custom visiting cards.' },
    supportedCustomization: { allowImageUpload: true, allowTextPrinting: true, maxUploadSizeBytes: 10485760, acceptedFileTypes: ['image/png', 'image/jpeg', 'application/pdf'] },
    requiredImages: ['front'],
  },
  {
    id: 'banner',
    name: 'Banner / Flex',
    icon: 'FaPalette',
    attributes: [
      { name: 'Size', values: ['3x2 ft', '4x3 ft', '6x4 ft', '8x4 ft', 'Custom'] },
      { name: 'Material', values: ['Star Flex', 'Vinyl', 'Fabric', 'Mesh'] },
    ],
    printAreas: [
      {
        id: 'front', label: 'Print Area',
        bounds: { x: 2, y: 2, width: 96, height: 96, rotation: 0 },
        maxUploadSizeBytes: 52428800,
        acceptedFileTypes: ['image/png', 'image/jpeg', 'application/pdf', 'application/illustrator', 'application/postscript'],
        name: 'Default', productionMethods: ['Vinyl', 'Sublimation'], recommendedDpi: 150, lockAspectRatio: false, allowText: true, allowImages: true,
      },
    ],
    defaultWeight: 500,
    seoTemplate: { title: '{name} — Custom Banner | F.S Print Works', description: 'Buy {name}. Large format custom banner printing.' },
    supportedCustomization: { allowImageUpload: true, allowTextPrinting: false, maxUploadSizeBytes: 52428800, acceptedFileTypes: ['image/png', 'image/jpeg', 'application/pdf'] },
    requiredImages: ['front'],
  },
  {
    id: 'acrylic_print',
    name: 'Acrylic Print',
    icon: 'FaPalette',
    attributes: [
      { name: 'Size', values: ['8x8 inch', '12x8 inch', '12x12 inch', '16x12 inch', '24x16 inch'] },
      { name: 'Thickness', values: ['3mm', '5mm', '8mm'] },
    ],
    printAreas: [
      {
        id: 'front', label: 'Print Area',
        bounds: { x: 2, y: 2, width: 96, height: 96, rotation: 0 },
        maxUploadSizeBytes: 20971520, acceptedFileTypes: ['image/png', 'image/jpeg', 'application/pdf'],
        name: 'Default', productionMethods: ['DTG', 'DTF'], recommendedDpi: 300, lockAspectRatio: true, allowText: false, allowImages: true,
      },
    ],
    defaultWeight: 400,
    seoTemplate: { title: '{name} — Custom Acrylic Print | F.S Print Works', description: 'Buy {name}. Premium acrylic photo print.' },
    supportedCustomization: { allowImageUpload: true, allowTextPrinting: false, maxUploadSizeBytes: 20971520, acceptedFileTypes: ['image/png', 'image/jpeg', 'application/pdf'] },
    requiredImages: ['front'],
  },
  {
    id: 'canvas_print',
    name: 'Canvas Print',
    icon: 'FaPalette',
    attributes: [
      { name: 'Size', values: ['12x8 inch', '16x12 inch', '20x16 inch', '24x18 inch', '36x24 inch'] },
      { name: 'Frame', values: ['Unframed', 'Gallery Wrap', 'Float Frame'] },
    ],
    printAreas: [
      {
        id: 'front', label: 'Print Area',
        bounds: { x: 2, y: 2, width: 96, height: 96, rotation: 0 },
        maxUploadSizeBytes: 20971520, acceptedFileTypes: ['image/png', 'image/jpeg', 'application/pdf'],
        name: 'Default', productionMethods: ['DTG', 'DTF'], recommendedDpi: 300, lockAspectRatio: true, allowText: false, allowImages: true,
      },
    ],
    defaultWeight: 600,
    seoTemplate: { title: '{name} — Custom Canvas Print | F.S Print Works', description: 'Buy {name}. Museum-quality canvas print.' },
    supportedCustomization: { allowImageUpload: true, allowTextPrinting: false, maxUploadSizeBytes: 20971520, acceptedFileTypes: ['image/png', 'image/jpeg', 'application/pdf'] },
    requiredImages: ['front'],
  },
];

export function getTemplateById(id: string): CategoryTemplate | undefined {
  return categoryTemplates.find(t => t.id === id);
}
