'use server'
import { prisma } from '@/utils/prisma'
import { product_categories } from '@/utils/sampledata'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import sharp from 'sharp'
import fs from 'fs/promises'
import path from 'path'

async function createProduct(data) {
	const session = await getServerSession()
    if (!session || !session.user.role || session.user.role != "admin") {
        return false
    }
	const newProduct = await prisma.product.create({
		data: {
			name: data.get('productName'),
			description: data.get('description'),
			product_categories_id: parseInt(data.get('category')),
			rating: 0.0,
		},
	})

	const productId = newProduct.id

	redirect(`/admin/products/${productId}/productsItem/add`)
}

async function createProductItem(data) {
	const session = await getServerSession()
    if (!session || !session.user.role || session.user.role != "admin") {
        return false
    }
    try {
   
  
      const { sku, size, amount, price, product_id } = data;
  
      // Criar o produto usando o Prisma
      await prisma.productItem.create({
        data: {
          sku: sku,
          size: size,
          amount: parseInt(amount),
          price: parseFloat(price),
          productItem_product: {
            connect: {
              id: parseInt(product_id),
            },
          },
        },
      });
  
      // Após criar o produto com sucesso, você pode chamar revalidatePath
      revalidatePath(`/admin/products/$1/productsItem/add`);
  
      // Retornar um objeto de sucesso, se necessário
      return { success: true, message: 'Produto criado com sucesso!' };
    } catch (error) {
        if (error.constructor.name === 'PrismaClientKnownRequestError') {
            // Lidar com o erro específico do Prisma
            if (error.code === 'P2002') {
              return { success: false, message: 'Erro ao criar o produto: SKU duplicado.' };
            }
        }

      return { success: false, message: 'Erro ao criar o produto.'};
    }
    }
  
  
async function updateProduct(data) {
	const session = await getServerSession()
    if (!session || !session.user.role || session.user.role != "admin") {
        return false
    }
	await prisma.product.update({
		where: {
			id: parseInt(data.get('id')),
		},
		data: {
			name: data.get('productName'),
			description: data.get('description'),
			product_categories_id: parseFloat(data.get('category')),
		},
	})

	revalidatePath(`/admin/products/$1/productsItem/add`)
}

async function updateProductItem(data) {
	const session = await getServerSession()
    if (!session || !session.user.role || session.user.role != "admin") {
        return false
    }
    await prisma.productItem.update({
        where: {
            sku: data.sku,
        },
        data: {
            //sku: data.sku,
            price: parseFloat(data.price),
            size: data.size,
            amount: parseInt(data.amount)
        },

    })

    revalidatePath(`/admin/products/$1/productsItem/add`)
}

async function queryProductById(data) {
	const session = await getServerSession()
    if (!session || !session.user.role || session.user.role != "admin") {
        return false
    }
	return await prisma.product.findMany({
		where: {
			id: parseInt(data),
		},
		select: {
			id: true,
			name: true,
			description: true,
			rating: true,
			product_categories_id: true,
		},
	})
}

async function queryProductCategory(data) {
	const session = await getServerSession()
    if (!session || !session.user.role || session.user.role != "admin") {
        return false
    }
	return await prisma.productCategory.findMany({
		where: {
			id: data ? parseInt(data) : null,
		},
		select: {
			id: true,
			name: true,
		},
	})
}

async function queryAllProducts() {
	const session = await getServerSession()
    if (!session || !session.user.role || session.user.role != "admin") {
        return false
    }
	return await prisma.product.findMany({
		select: {
			id: true,
			name: true,
			rating: true,
			product_categories_id: true,
		},
	})
}

async function queryAllCategories() {
	return await prisma.productCategory.findMany({
		select: {
			id: true,
			name: true,
		},
	})
}

async function queryAllProductsItem(data) {
	return await prisma.productItem.findMany({
		where: {
			product_id: parseInt(data),
		},
		select: {
			sku: true,
			price: true,
			size: true,
			amount: true,
		},
	})
}

async function sharpImage(file) {
	try {
		const tempFolderPath = './public/upload'; 
		const tempFilePath = path.join(tempFolderPath, file.name);
		await fs.writeFile(tempFilePath, file);

		const resizedBuffer = await sharp(tempFilePath)
			.resize({ width: 800, height: 600, fit: 'cover', position: 'center' })
			.toBuffer();
	
		await fs.unlink(tempFilePath);
  
	  return resizedBuffer;
	} catch (error) {
	  console.error('Erro ao processar o arquivo temporário:', error);
	  throw error;
	}
  }

export { 
	createProduct,
	createProductItem, 
	updateProduct, queryProductById, 
	queryAllProducts, 
	queryAllProductsItem, 
	queryProductCategory, 
	updateProductItem, 
	sharpImage, 
	queryAllCategories
}

