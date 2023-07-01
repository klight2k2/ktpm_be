const sql = require('mysql2');
class BookController{
    async getTrendingBook(req,res){
        const pool=req.app.locals.db;
        try{
            pool.query(`SELECT  Book.id,Book.title,Book.description,Book.image,Book.price,Publisher.[name] as publisher FROM Book,Publisher 
                            where Book.id in (select book_id from (SELECT TOP 4  book_id,SUM(num) AS SUM_NUM FROM Orders_Detail 
                            GROUP BY book_id ORDER BY SUM_NUM DESC ) as trending) 
                            AND Publisher.id=Book.publisher_id `,(err,recordset)=>{
                res.status(200).send(recordset?.recordset)
            })


        }catch(err){
            console.log(err);
            return res.status(500).json({message:"SERVER ERROR"})
        }
    }
    async getDetailBook(req,res){
        const pool=req.app.locals.db;
        try{
            const book_id=req.body.book_id;
            pool.query(`
            SELECT Book.id,Book.title,Book.description,Book.[image],Author.name as author,Book.price,Publisher.[name] as publisher FROM Book,Author,AuthorBook,Publisher 
                                       where Book.id=${book_id}
                                       AND Book.id=AuthorBook.book_id
                                       AND AuthorBook.author_id=Author.id
                                       AND Publisher.id=Book.publisher_id  `,(err,recordset)=>{
                                        let books=[];
                                        // console.log(recordset);
                                        recordset?.recordset.map(record=>{
                                            if(books.length==0){
            
                                                books.push({...record,author:[record.author]});
                                                return;
                                            } else{
                                                // console.log(record);
                                                const booksLength=books?.length||0;
                                                console.log(booksLength);
                                                for(let i=0; i<booksLength; i++){
                                                    // console.log(i);
                                                    console.log(books[i].id,record.id);
                                                    if(books[i].id==record.id) {
                                                        console.log('check1');
                                                        books[i]?.author?.push(record.author);
                                                        break;
                                                    }
                                                    if(i===booksLength-1){
                                                        books.push({...record,author:[record.author]});
                                                        break;
                                                    } 
                                                }
                                            }
                                            // console.log(books);
                                        })
                                        // console.log(books);
                                    res.status(200).send(books[0])
            })


        }catch(err){
            console.log(err);
            return res.status(500).json({message:"SERVER ERROR"})
        }
    }
    async getCategories(req,res){
        const pool=req.app.locals.db;
        try{
            pool.query('SELECT * FROM Category',(err,recordset)=>{
                if(err){
                    res.status(500).json({message:"SERVER ERROR"});
                }
                res.status(200).send(recordset.recordset);

            })

    }catch(err){
        return null;
    }}
    async getPublishers(req,res){
        const pool=req.app.locals.db;
        try{
            pool.query('SELECT * FROM Publisher',(err,recordset)=>{
                if(err){
                    res.status(500).json({message:"SERVER ERROR"});
                }
                res.status(200).send(recordset.recordset);

            })

    }catch(err){
        return null;
    }}
    async getAll(req,res){
        const pool=req.app.locals.db;
        try{
            const getAll=`SELECT Book.id,Book.title,Book.description,Book.image,Book.price,Author.[name] as author,Publisher.[name] as publisher FROM Book,Author,Publisher,AuthorBook 
            where  Book.id=AuthorBook.book_id
            AND Author.id=AuthorBook.author_id
            AND Publisher.id=Book.publisher_id`
            pool.query(getAll,(err,recordset)=>{
                if(err){
                    res.status(500).json({message:"SERVER ERROR"});
                }
                res.status(200).send(recordset?.recordset);

            })

    }catch(err){
        return null;
    }}
    async searchByTitle(req,res){
        const pool=req.app.locals.db;
        try{
            const searchByTitle=`SELECT *,Author.[name] as author,Publisher.[name] as publisher FROM Book,Author,Publisher,AuthorBook
            where Book.title like N'%${req.body.bookTitle}%'

            AND  Book.id=AuthorBook.book_id
            AND Author.id=AuthorBook.author_id
            AND Publisher.id=Book.publisher_id`
            pool.query(searchByTitle,(err,recordset)=>{
                if(err){
                    res.status(500).json({message:"SERVER ERROR"});
                }
                res.status(200).send(recordset.recordset);

            })

    }catch(err){
        return null;
    }}
    async searchByCategory(req,res){
        const pool=req.app.locals.db;
        const categoryId=req.body.categoryId;
        try{
                const searchBook=`SELECT * FROM Book
                JOIN BookCategory ON Book.id = BookCategory.book_id
                 WHERE category_id =${categoryId}
                `
                console.log(searchBook);
                pool.query(searchBook,(err,recordset)=>{
                                    if(err){
                                        console.log(err);
                                        if(recordset?.recordset?.length==0) return res.status(200).json({code:200,message:"Không tìm thấy quyển sách nào như vậy!"});
                                        res.status(500).json({message:"SERVER ERROR"});
                                    }
                                    console.log(recordset);
                                    res.status(200).send(recordset?.recordset);

                                })

    }catch(err){

        console.log(err);
        return null;
    }}
    async searchBookAdvance(req,res){
        const pool=req.app.locals.db;
        if(!req.body.selectedCategoriesId)  {
            console.log("êrr");
            return res.status(500).json({code:500,message:"Không tìm thấy quyển sách nào như vậy!"});}

        let {bookName,authorName,maxPrice,minPrice,selectedCategoriesId,selectedPublisherId}={...req.body};
        console.log(bookName,authorName,maxPrice,minPrice,selectedCategoriesId,selectedPublisherId)
        selectedCategoriesId=selectedCategoriesId.join(",");

        try{
                const searchBook=`SELECT *,Author.[name] as author FROM Book
                JOIN AuthorBook ON Book.id = AuthorBook.book_id
                JOIN BookCategory ON Book.id = BookCategory.book_id
                JOIN Author ON Author.id = AuthorBook.author_id
                 WHERE (Author.name LIKE N'%${authorName}%')
                 AND (category_id in (${selectedCategoriesId}))
                AND (publisher_id = ${selectedPublisherId})
                AND (title LIKE N'%${bookName}%')
                AND (price >= ${minPrice} AND price <= ${maxPrice})`
                console.log(searchBook);
                pool.query(searchBook,(err,recordset)=>{
                                    if(err){
                                        console.log(err);
                                        if(recordset?.recordset?.length==0) return res.status(200).json({code:200,message:"Không tìm thấy quyển sách nào như vậy!"});
                                        return res.status(500).json({code:500,message:"Không tìm thấy quyển sách nào như vậy!"});
                                    }
                                    console.log(recordset);
                                    if(recordset?.recordset?.length==0) return res.status(200).json({code:500,message:"Không tìm thấy quyển sách nào như vậy!"});
                                    res.status(200).send(recordset?.recordset);

                                })

    }catch(err){

        console.log(err);
        return null;
    }}
    
}

module.exports=new BookController();

// const sql = require('mssql');
// class BookController{
//     async getTrendingBook(req,res){
//         const pool=req.app.locals.db;
//         try{
//             pool.query(`SELECT Book.id,Book.title,Book.description,Book.[image],Author.name as author,Book.price,Publisher.[name] as publisher FROM Book,Author,AuthorBook,Publisher 
//                         where Book.id in (select book_id from (SELECT TOP 5  book_id,SUM(num) AS SUM_NUM FROM Orders_Detail 
//                         GROUP BY book_id ORDER BY SUM_NUM DESC ) as trending) 
//                         AND Book.id=AuthorBook.book_id
//                         AND AuthorBook.author_id=Author.id
//                         AND Publisher.id=Book.publisher_id `   ,(err,recordset)=>{
//                             if(err) console.log(err);
//                             let books=[];
//                             // console.log(recordset);
//                             recordset?.recordset.map(record=>{
//                                 if(books.length==0){

//                                     books.push({...record,author:[record.author]});
//                                     return;
//                                 } else{
//                                     // console.log(record);
//                                     const booksLength=books?.length||0;
//                                     console.log(booksLength);
//                                     for(let i=0; i<booksLength; i++){
//                                         // console.log(i);
//                                         console.log(books[i].id,record.id);
//                                         if(books[i].id==record.id) {
//                                             console.log('check1');
//                                             books[i]?.author?.push(record.author);
//                                             break;
//                                         }
//                                         if(i===booksLength-1){
//                                             books.push({...record,author:[record.author]});
//                                             break;
//                                         } 
//                                     }
//                                 }
//                                 // console.log(books);
//                             })
//                             // console.log(books);
//                         res.status(200).send(books)
//         })

//         }catch(err){
//             console.log(err);
//             return res.status(500).json({message:"SERVER ERROR"})
//         }
//     }
//     async getCategories(req,res){
//         const pool=req.app.locals.db;
//         try{
//             pool.query('SELECT * FROM Category',(err,recordset)=>{
//                 if(err){
//                     res.status(500).json({message:"SERVER ERROR"});
//                 }
//                 res.status(200).send(recordset.recordset);

//             })

//     }catch(err){
//         return null;
//     }}
//     async getPublishers(req,res){
//         const pool=req.app.locals.db;
//         try{
//             pool.query('SELECT * FROM Publisher',(err,recordset)=>{
//                 if(err){
//                     res.status(500).json({message:"SERVER ERROR"});
//                 }
//                 res.status(200).send(recordset.recordset);

//             })

//     }catch(err){
//         return null;
//     }}
//     async getAll(req,res){
//         const pool=req.app.locals.db;
//         try{
//             const getAll=`SELECT Book.id,Book.title,Book.description,Book.[image],Author.name as author,Book.price,Publisher.[name] as publisher FROM Book,Author,AuthorBook,Publisher 
//             where  Book.id=AuthorBook.book_id
//             AND AuthorBook.author_id=Author.id
//             AND Publisher.id=Book.publisher_id
//             ORDER BY book.id
//             FETCH NEXT 20 ROWS ONLY
//             `
//             pool.query(getAll,(err,recordset)=>{
//                 if(err){
                    
//                     res.status(500).json({message:"SERVER ERROR"});
//                 }
//                 let books=[];
//                 console.log(recordset);
//                 recordset?.recordset.map(record=>{
//                     if(books.length==0){

//                         books.push({...record,author:[record.author]});
//                         return;
//                     } else{
//                         // console.log(record);
//                         const booksLength=books?.length||0;
//                         console.log(booksLength);
//                         for(let i=0; i<booksLength; i++){
//                             // console.log(i);
//                             console.log(books[i].id,record.id);
//                             if(books[i].id==record.id) {
//                                 console.log('check1');
//                                 books[i]?.author?.push(record.author);
//                                 break;
//                             }
//                             if(i===booksLength-1){
//                                 books.push({...record,author:[record.author]});
//                                 break;
//                             } 
//                         }
//                     }
//                     // console.log(books);
//                 })
//                 // console.log(books);
//             // res.status(200).send(books)
//             })

//     }catch(err){
//         return null;
//     }}
//     async searchByTitle(req,res){
//         const pool=req.app.locals.db;
//         try{
//             const searchByTitle=`SELECT *,Author.[name] as author,Publisher.[name] as publisher FROM Book,Author,Publisher 
//             where Book.title like N'%${req.body.bookTitle}%'
//             AND Book.author_id=Author.id
//             AND Publisher.id=Book.publisher_id`
//             pool.query(searchByTitle,(err,recordset)=>{
//                 if(err){
//                     res.status(500).json({message:"SERVER ERROR"});
//                 }
//                 res.status(200).send(recordset.recordset);

//             })

//     }catch(err){
//         return null;
//     }}
//     async searchBookAdvance(req,res){
//         const pool=req.app.locals.db;
//         let {bookName,authorName,maxPrice,minPrice,selectedCategoriesId,selectedPublisherId}={...req.body};
//         console.log(bookName,authorName,maxPrice,minPrice,selectedCategoriesId,selectedPublisherId)
//         selectedCategoriesId=selectedCategoriesId.join(",");
//         try{
//                 const searchBook=`SELECT *,Author.[name] as author FROM Book
//                 JOIN AuthorBook ON Book.id = AuthorBook.book_id
//                 JOIN BookCategory ON Book.id = BookCategory.book_id
//                 JOIN Author ON Author.id = AuthorBook.author_id
//                  WHERE (Author.name LIKE N'%${authorName}%')
//                  AND (category_id in (${selectedCategoriesId}))
//                 AND (publisher_id = ${selectedPublisherId})
//                 AND (title LIKE N'%${bookName}%')
//                 AND (price > ${minPrice} AND price <= ${maxPrice})`
//                 console.log(searchBook);
//                 pool.query(searchBook,(err,recordset)=>{
//                                     if(err){
                                        
//                                         res.status(500).json({message:"SERVER ERROR"});
//                                     }
//                                     console.log(recordset);
//                                     res.status(200).send(recordset?.recordset);

//                                 })

//     }catch(err){
//         console.log(err);
//         return null;
//     }}
// }

// module.exports=new BookController();