import { prisma } from "@/src/lib/prisma";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

export const signInEmailPassword = async (email: string, password: string) => {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }
  const user = await prisma.user.findUnique({
    where: { email },
  });
  if (!user) {
    const dbUser = await createUser(email, password);
    return dbUser;
  }
  // Look up a linked Account record that stores the hashed password
  const account = await prisma.account.findFirst({
    where: { userId: user.id },
  });

  if (!account || !account.password) {
    // No password set for this user
    return null;
  }

  if (!bcrypt.compareSync(password, account.password)) {
    return null;
  }

  return user;
};

const createUser = async (email: string, password: string) => {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  // Create the user
  const user = await prisma.user.create({
    data: {
      id: randomUUID(),
      email: email,
      name: email.split("@")[0],
    },
  });

  // Create a linked Account record to store the hashed password
  await prisma.account.create({
    data: {
      id: randomUUID(),
      userId: user.id,
      accountId: email,
      providerId: "credentials",
      password: bcrypt.hashSync(password),
    },
  });

  return user;
};
