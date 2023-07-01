const sql = require('mysql2');

class UserController {
	async orders(req,res){
			const pool=req.app.locals.db;
			try{
				const user_id=req.user.id;
				const {note,address,phone_number}= {...req.body} ;
				let total_money=0;
				const ordersId=req.body.orders.map(order=>order.id).join(",");
				const orders=req.body.orders.sort((a,b)=>a.id-b.id);
				console.log(req.body.orders);
				const books=await pool.query(`SELECT * FROM Book WHERE Book.id in (${ordersId})`)
				const check=books.recordset.sort((a,b)=>a.id-b.id).every((book,index)=>{
					total_money+=orders[index].num*book.price;
					return orders[index].num<=book.quantity;
				})
				console.log(check);
				const orderQuery=`DECLARE @ID INT
				INSERT INTO Orders([user_id],[note],[phone_number],[address],[order_date],[status_id],[total_money])
				VALUES (${user_id},N'${note}','${phone_number}',N'${address}',GETDATE(),1,${total_money})
								(SELECT SCOPE_IDENTITY() AS [SCOPE_IDENTITY]);	
								`
								console.log(orderQuery);
								if(check){
					const transaction=new sql.Transaction(pool)
					try{
						
						await transaction.begin()
						const request = new sql.Request(transaction)
						const result= await request.query(orderQuery)
						console.log(result);
						const order_id=result.recordset[0].SCOPE_IDENTITY
						// const orderDetailQuery=`INSERT INTO Orders_Detail([order_id],[book_id],[price],[num]) VALUES ${ordersDetail}`

						for (let i=0 ;i<orders.length ;i++) {
							const book=orders[i]
							await request.query(` INSERT INTO Orders_Detail([order_id],[book_id],[price],[num]) VALUES (${order_id},${book.id},${book.price},${book.num})`)

						}
						orders.map(async (book)=>{
							const request = new sql.Request(transaction)
						} );
						// console.log(orderDetailQuery);
						// const result2=await request.query(orderDetailQuery)
						// const ordersDetail=orders.map(book=> `(${order_id},${book.id},${book.price},${book.num})`).join("\n,")+';';
						// const orderDetailQuery=`INSERT INTO Orders_Detail([order_id],[book_id],[price],[num]) VALUES ${ordersDetail}`
						// console.log(orderDetailQuery);
						// const result2=await request.query(orderDetailQuery)
						// console.log(result2);
						transaction.commit(err => {
							// ... error checks
							
							console.log("Transaction committed.")
						})
						return res.status(200).json({code:200,message:"Đặt hàng thành công"});
					}catch(err){
						console.log(err);
						transaction.rollback()
					}
					
				}else{
					return res.status(500).json({message:"Đơn hàng bạn đặt không còn đủ hàng"})
				}
	
	
			}catch(err){
				console.log(err);
				return res.status(500).json({message:"SERVER ERROR"})
			}
	}

	async getPurchase(req,res){
        const pool=req.app.locals.db;
        try{
			const user_id=req.user.id;
			console.log(user_id);
            const ordersDetail=await pool.query(`select * from [Order_Book_User] where user_id=${user_id} order by order_date desc`);
            let ordersInfo=await pool.query(`select * from [Orders_status] where user_id=${user_id} order by order_date desc`);
			ordersInfo=ordersInfo.recordset.map(orderInfo=>({...orderInfo,ordersDetail:[]}));

			ordersDetail.recordset.map(
				(orderDetail)=>{
					ordersInfo.map((orderInfo,index)=>{
						
						if(orderInfo.order_id== orderDetail.order_id) {
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
        const pool=req.app.locals.db;
        try{
			const user_id=parseInt(req.user.id);
			const order_id=parseInt(req.body.order_id);
			console.log(order_id);

            const order=await pool.query(`select * from [Orders] where id=${order_id} and user_id=${user_id}`);
			console.log(order);
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


}

module.exports = new UserController();
