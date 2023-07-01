const sql = require('mysql2');

class AdminController {
	checkAdmin(req,res){
		if(req.user.role!==2) return res.status(500).json({code:500,message:"Bạn không phải admin!"})
	}
	async addBook(req,res){
		if(req.user.role!==2) return res.status(500).json({code:500,message:"Bạn không phải admin!"})
            // if(req?.user?.role_id!=2) return res.status(500).json({message:"You are not allowed to access this page"});
			const pool=req.app.locals.db;
			console.log(req.file);
			console.log();
			try{
				const transaction=new sql.Transaction(pool)
				try{
					
					await transaction.begin()
					const request = new sql.Request(transaction)
					const image =req.file.filename; // Note: set path dynamically
				
					const book=await request.query(`
					INSERT INTO Book(title, price, description, image, publisher_id, pages, quantity)
					VALUES (N'${req.body.title}',${req.body.price},N'${req.body.description}',N'${image}', ${req.body.publisher},${req.body.pages},${req.body.quantity});
					(SELECT SCOPE_IDENTITY() AS [SCOPE_IDENTITY]);	
					`)
					const book_id=book.recordset[0].SCOPE_IDENTITY;
					await request.query(`insert into [AuthorBook]
					values (${req.body.author_id},${book_id})
					`);
					const listCategoryId=req.body.category_id.split(',').map(item=>{
						const category_id=parseInt(item);
						return `(${book_id},${category_id}),`;
					}).join('').slice(0,-1);
					await request.query(`insert into [BookCategory]
					values ${listCategoryId}
					`);
					
					console.log(book);
					transaction.commit(err => {
						// ... error checks
						console.log(err);
						console.log("Transaction committed.")
					})
					return res.status(200).json({code:200,message:"Add book successfully!"});
				}catch(err){
					console.log(err);
					transaction.rollback()
					return res.status(500).json({code:500,message:"Something went wrong!"});
				}
					
	
			}catch(err){
				console.log(err);
				return res.status(500).json({message:"SERVER ERROR"})
			}
	}
	async getUsers(req,res){
		if(req.user.role!==2) return res.status(500).json({code:500,message:"Bạn không phải admin!"})
            // if(req?.user?.role_id!=2) return res.status(500).json({message:"You are not allowed to access this page"});
			const pool=req.app.locals.db;
			try{
				// const user_id=req.user.id;
				const users=await pool.query(`SELECT * FROM [User]`)
				return res.status(200).json(users.recordset)
					
	
			}catch(err){
				console.log(err);
				return res.status(500).json({message:"SERVER ERROR"})
			}
	}
	async getAuthors(req,res){
		if(req.user.role!==2) return res.status(500).json({code:500,message:"Bạn không phải admin!"})
            // if(req?.user?.role_id!=2) return res.status(500).json({message:"You are not allowed to access this page"});
			const pool=req.app.locals.db;
			try{
				// const user_id=req.user.id;
				const users=await pool.query(`SELECT * FROM [Author]`)
				return res.status(200).json(users.recordset)
					
	
			}catch(err){
				console.log(err);
				return res.status(500).json({message:"SERVER ERROR"})
			}
	}
	async updateUser(req,res){
		if(req.user.role!==2) return res.status(500).json({code:500,message:"Bạn không phải admin!"})
            // if(req?.user?.role_id!=2) return res.status(500).json({message:"You are not allowed to access this page"});
			const pool=req.app.locals.db;
			console.log(req.body)
			const user=req.body.user;
			try{
				const transaction=new sql.Transaction(pool)
				try{
					
					await transaction.begin()
					const request = new sql.Request(transaction)
					console.log(`
					UPDATE [User]
					SET fullname = N'${user.fullname}',
					sex = N'${user.sex}',
					DOB = '${user.dob}',
					phone_number = '${user.phone_number}',
					address = N'${user.address}',
					password = N'${user.password}',
					role_id =${user.role_id}
					WHERE id=${user.id}`);
					await request
					.query(`
					UPDATE [User]
					SET fullname = N'${user.fullname}',
					sex = N'${user.sex}',
					DOB = '${user.dob}',
					phone_number = '${user.phone_number}',
					address = N'${user.address}',
					password = N'${user.password}',
					role_id =${user.role_id},
					email = '${user.email}'
					WHERE id=${user.id}`)
					transaction.commit(err => {
						// ... error checks
						console.log(err);
						console.log("Transaction committed.")
					})
					return res.status(200).json({code:200,message:"Update user success!"});
				}catch(err){
					console.log(err);
					transaction.rollback()
					return res.status(500).json({code:500,message:"Something went wrong!"});
				}
					
	
			}catch(err){
				console.log(err);
				return res.status(500).json({message:"SERVER ERROR"})
			}
	}

	async deleteBook(req,res){
		if(req.user.role!==2) return res.status(500).json({code:500,message:"Bạn không phải admin!"})
            // if(req?.user?.role_id!=2) return res.status(500).json({message:"You are not allowed to access this page"});
			const book_id=req.body.book_id;
			console.log(book_id, "hello");
			const pool=req.app.locals.db;
			try{
				// const book_id=req.user.id;
				console.log(`delete from  [Book]  where id=${book_id}`);
				const transaction=new sql.Transaction(pool)
				try{
					
					await transaction.begin()
					const request = new sql.Request(transaction)
					await request.query(`delete from  [Book]  where id=${book_id}`)
					transaction.commit(err => {
						// ... error checks
						console.log("Transaction committed.")
					})
					return res.status(200).json({code:200,message:"Xóa sách thành công!"});
				}catch(err){
					console.log(err);
					transaction.rollback()
				}
				
			}catch(err){
				console.log(err);
				return res.status(500).json({message:"SERVER ERROR"})
			}
	}

	async deleteUser(req,res){
		if(req.user.role!==2) return res.status(500).json({code:500,message:"Bạn không phải admin!"})
            // if(req?.user?.role_id!=2) return res.status(500).json({message:"You are not allowed to access this page"});
			const user_id=req.body.user_id;
			console.log(user_id);
			const pool=req.app.locals.db;
			try{
				// const user_id=req.user.id;
				const transaction=new sql.Transaction(pool)
				try{
					
					await transaction.begin()
					const request = new sql.Request(transaction)
					await request.query(`delete from  [User]  where id=${user_id}`)
					transaction.commit(err => {
						// ... error checks
						console.log("Transaction committed.")
					})
					return res.status(200).json({code:200,message:"Xóa user thành công!"});
				}catch(err){
					console.log(err);
					transaction.rollback()
				}
				
			}catch(err){
				console.log(err);
				return res.status(500).json({message:"SERVER ERROR"})
			}
	}

	async createUser(req, res) {
		if(req.user.role!==2) return res.status(500).json({code:500,message:"Bạn không phải admin!"})
		const pool=req.app.locals.db
		console.log(req.body);
		req.body.role_id=parseInt(req.body.role_id);
		try {
			await pool.request().input('email',sql.VarChar,req.body.email)
		.query('SELECT * FROM [User] where email=@email ', function(err, recordset) {
			if (err) {
			  console.error(err)
			  res.status(500).send('SERVER ERROR')
			  return;
			}
			// if(recordset.)
			const user=recordset.recordset[0];
			if(!!user){
				res.status(500).json("Email already exists");
				return;
			}
			console.log(req.body.sex=='male');
			if(req.body.sex !=='female' && req.body.sex!=='male') return res.status(500).json({message:"register failed!"});
			 if(!req.body.role_id || req.body.role_id!=2)req.body.role_id=1;
			const query=`INSERT INTO [User] ([fullname],[sex],[DOB],[email],[phone_number],[address],[password],[role_id]) VALUES
							(N'${req.body.fullname}','${req.body.sex}','${req.body.dob}',N'${req.body.email}',N'${req.body.phone_number}',N'${req.body.address}',N'${req.body.password}',${req.body.role_id});`
				pool.query(query,(err,result)=>{
					try{
						if(err) res.status(500).json("Cant't register user!");
						console.log(result)
						return res.status(200).json({code:200,message:"Register successfully!"})
						}catch(e){
							console.log(e);
						}
					}
				)
		  })
		} catch (err) {
			console.log(err);
			return res.status(500).json('Can not create user');
		}
	}

    async getAll(req,res){
		if(req.user.role!==2) return res.status(500).json({code:500,message:"Bạn không phải admin!"})
        const pool=req.app.locals.db;
        try{
            const getAll=`SELECT Book.id,Book.title,Book.quantity,Book.description,Book.image,Book.price,Publisher.[name] as publisher FROM Book,Publisher 
            where Publisher.id=Book.publisher_id`
            pool.query(getAll,(err,recordset)=>{
                if(err){
                    res.status(500).json({message:"SERVER ERROR"});
                }
                res.status(200).send(recordset.recordset);

            })

    }catch(err){
        return null;
    }}
    async getOrders(req,res){
		if(req.user.role!==2) return res.status(500).json({code:500,message:"Bạn không phải admin!"})
        const pool=req.app.locals.db;
        try{
			const user_id=req.user.id;
			console.log(user_id);
            const ordersDetail=await pool.query(`select * from [Order_Book_User]  order by order_date desc`);
            let ordersInfo=await pool.query(`select * from [Orders_status]  order by order_date desc`);
			ordersInfo=ordersInfo.recordset.map(orderInfo=>({...orderInfo,ordersDetail:[],email:''}));

			ordersDetail.recordset.map(
				(orderDetail)=>{
					ordersInfo.map((orderInfo,index)=>{
						
						if(orderInfo.order_id== orderDetail.order_id) {
							orderInfo.email=orderDetail.email
							const reduceOrderDetail={book_id:orderDetail.book_id,price:orderDetail.price,title:orderDetail.title,image:orderDetail.image,author:orderDetail.author,num:orderDetail.num};
							orderInfo.ordersDetail.push(reduceOrderDetail);
						}
					})
				}
			)
				return res.status(200).json(ordersInfo);

        }catch(err){
            console.log(err);
            return res.status(500).json({message:"SERVER ERROR"})
        }
    }

	async cancelOrder(req,res){
		if(req.user.role!==2) return res.status(500).json({code:500,message:"Bạn không phải admin!"})
        const pool=req.app.locals.db;
		console.log("hello");
		const order_id=req.body.order_id;
		console.log("ORDER NAY",req.body);
        try{
            const order=await pool.query(`select * from [Orders] where id=${order_id}`);
			if(order.recordset.length<=0 || order.recordset[0].status_id==4){
				return res.status(500).json({message:"Đơn hàng đã bị hủy"});
			}
            await pool.query(`update [Orders] set status_id=4 where id=${order_id}`);
			let ordersDetail= await pool.query(`select * from [Orders_Detail] where order_id=${order_id}`);
			ordersDetail=ordersDetail.recordset;
			for (let i=0 ;i<ordersDetail.length ;i++) {
				const orderDetail=ordersDetail[i]
				await pool.query(`update [Book] set quantity=quantity+${orderDetail.num} where id=${orderDetail.book_id}`)
			}
		
				return res.status(200).json({code:200,message:"Hủy đơn hàng thành công"});

        }catch(err){
            console.log(err);
            return res.status(500).json({message:"SERVER ERROR"})
        }
    }
	async updateStatus(req,res){
		if(req.user.role!==2) return res.status(500).json({code:500,message:"Bạn không phải admin!"})
        const pool=req.app.locals.db;
        try{
			const order_id=parseInt(req.body.order_id);
			const status=parseInt(req.body.status);

            const order=await pool.query(`select * from [Orders] where id=${order_id}`);
			console.log(order);
			if(order.recordset.length<=0 || order.recordset[0].status_id==4){
				return res.status(500).json({message:"Đơn hàng đã bị hủy"});
			}
            await pool.query(`update [Orders] set status_id=${status} where id=${order_id}`);
			return res.status(200).json({code:200,message:"Thay đổi trạng thái đơn hàng thành công"});

        }catch(err){
            console.log(err);
            return res.status(500).json({message:"SERVER ERROR"})
        }
    }

	// async getPurchase(req,res){
	// 	if(req.user.role!==2) return res.status(500).json({code:500,message:"Bạn không phải admin!"})
    //     const pool=req.app.locals.db;
    //     try{
	// 		const user_id=req.user.id;
	// 		console.log(user_id);
    //         const ordersDetail=await pool.query(`select * from [Order_Book_User] where user_id=${user_id} order by order_date desc`);
    //         let ordersInfo=await pool.query(`select * from [Orders_status] where user_id=${user_id} order by order_date desc`);
	// 		ordersInfo=ordersInfo.recordset.map(orderInfo=>({...orderInfo,ordersDetail:[]}));

	// 		ordersDetail.recordset.map(
	// 			(orderDetail)=>{
	// 				ordersInfo.map((orderInfo,index)=>{
						
	// 					if(orderInfo.order_id== orderDetail.order_id) {
	// 						const reduceOrderDetail={book_id:orderDetail.book_id,price:orderDetail.price,title:orderDetail.title,image:orderDetail.image,author:orderDetail.author,num:orderDetail.num};
	// 						orderInfo.ordersDetail.push(reduceOrderDetail);
	// 					}
	// 				})
	// 			}
	// 		)
	// 			return res.status(200).json(ordersInfo);

    //     }catch(err){
    //         console.log(err);
    //         return res.status(500).json({message:"SERVER ERROR"})
    //     }
    // }
	// async cancelOrder(req,res){
    //     const pool=req.app.locals.db;
    //     try{
	// 		const user_id=parseInt(req.user.id);
	// 		const order_id=parseInt(req.body.order_id);
	// 		console.log(order_id);

    //         const order=await pool.query(`select * from [Orders] where id=${order_id} and user_id=${user_id}`);
	// 		console.log(order);
	// 		if(order.recordset.length<=0 || order.recordset[0].status_id==4){
	// 			return res.status(500).json({message:"Đơn hàng đã bị hủy"});
	// 		}
    //         await pool.query(`update [Orders] set status_id=4 where id=${order_id}`);
	// 		let ordersDetail= await pool.query(`select * from [Orders_Detail] where order_id=${order_id}`);
	// 		ordersDetail=ordersDetail.recordset;
	// 		for (let i=0 ;i<ordersDetail.length ;i++) {
	// 			const orderDetail=ordersDetail[i]
	// 			await pool.query(`update [Book] set quantity=quantity+${orderDetail.num} where id=${orderDetail.book_id}`)

	// 		}
		
	// 			return res.status(200).json({code:200,message:"Hủy đơn hàng thành công"});

    //     }catch(err){
    //         console.log(err);
    //         return res.status(500).json({message:"SERVER ERROR"})
    //     }
    // }


}

module.exports = new AdminController();
