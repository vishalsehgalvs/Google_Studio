import prisma from '../models/prismaClient.js';

export const getMachinery = async (req, res) => {
  const machinery = await prisma.machinery.findMany();
  res.json(machinery);
};

export const rentMachinery = async (req, res) => {
  // Example: update availability
  const { id } = req.body;
  await prisma.machinery.update({ where: { id: Number(id) }, data: { available: false } });
  res.json({ success: true, id });
};

export const addMachinery = async (req, res) => {
  const { name, type, rentPrice, description, imageUrl } = req.body;
  const machinery = await prisma.machinery.create({ data: { name, type, rentPrice: Number(rentPrice), description, imageUrl, available: true } });
  res.json(machinery);
};

export const updateMachinery = async (req, res) => {
  const { id } = req.params;
  const { name, type, rentPrice, description, imageUrl, available } = req.body;
  const machinery = await prisma.machinery.update({
    where: { id: Number(id) },
    data: { name, type, rentPrice: Number(rentPrice), description, imageUrl, available }
  });
  res.json(machinery);
};

export const deleteMachinery = async (req, res) => {
  const { id } = req.params;
  await prisma.machinery.delete({ where: { id: Number(id) } });
  res.json({ success: true });
};
