import prisma from "../config/prisma.js";

export const findById = async (id) => {
  console.log("[user.model] findById:", id);
  return prisma.user.findUnique({ where: { id } });
};

export const create = async (id) => {
  console.log("[user.model] create:", id);
  return prisma.user.create({ data: { id } });
};
