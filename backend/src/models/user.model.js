import prisma from "../config/prisma.js";

export const findById = async (id) => {
  return prisma.user.findUnique({ where: { id } });
};

export const create = async (id) => {
  return prisma.user.create({ data: { id } });
};
