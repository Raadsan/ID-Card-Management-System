// import { prisma } from "../lib/prisma.js";
// import QRCode from "qrcode";
// export const createIDCard = async (req, res) => {
//   try {
//     const { employeeId } = req.body;

    

//     // Check employee exists
//     const employee = await prisma.employee.findUnique({
//       where: { id: Number(employeeId) },
//     });
//     if (!employee)
//       return res.status(404).json({ message: "Employee not found" });

//     // Check if ID card already exists
//     const existingID = await prisma.idCard.findUnique({
//       where: { employeeId: Number(employeeId) },
//     });
//     if (existingID)
//       return res.status(409).json({ message: "ID card already exists for this employee" });

//     // Generate QR code (encode employeeId)
//     const qrData = JSON.stringify({ employeeId: employee.id });
//     const qrCodeImage = await QRCode.toDataURL(qrData);

//     // Create IDCard record
//     const idCard = await prisma.idCard.create({
//       data: {
//         employeeId: employee.id,
//         qrCode: qrCodeImage,
//         status: "created",
//       },
//     });

//     res.status(201).json(idCard);
//   } catch (error) {
//     res.status(500).json({ message: "Failed to create ID card", error: error.message });
//   }
// };


// export const scanIDCard = async (req, res) => {
//   try {
//     const { employeeId } = req.params; // extracted from QR code JSON

//     const idCard = await prisma.iDCard.findUnique({
//       where: { employeeId: Number(employeeId) },
//       include: { employee: { include: { user: true, department: true } } },
//     });

//     if (!idCard) return res.status(404).json({ message: "ID card not found" });
//     if (idCard.status !== "created")
//       return res.status(403).json({ message: "ID card is not created" });

//     res.status(200).json(idCard);
//   } catch (error) {
//     res.status(500).json({ message: "Failed to fetch ID card", error: error.message });
//   }
// };
