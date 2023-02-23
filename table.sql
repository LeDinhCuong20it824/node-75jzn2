create table users(
    id int primary key AUTO_INCREMENT,
    name varchar(250),
    contactNumber varchar(10),
    email varchar(100),
    password varchar(100),
    status varchar(20),
    role varchar(20),
    UNIQUE (email)
);

insert into users(name,contactNumber,email,password,status,role) values('admin','0348706197','admin@gmail.com','0123','true','admin'); 

create table category(
    id int NOT NULL AUTO_INCREMENT,
    name varchar(250) NOT NULL,
    primary key(id)
);

create table product(
    id int NOT NULL AUTO_INCREMENT,
    name varchar(250) NOT NULL,
    categoryID integer NOT NULL,
    description varchar(255),
    price integer,
    status varchar(20),
    primary key(id)
);

create table bill(
    id int NOT NULL AUTO_INCREMENT,
    uuid varchar(200) NOT NULL,
    name varchar(250) NOT NULL,
    email varchar(100) NOT NULL,
    contactNumber varchar(10) NOT NULL,
    paymentMethod varchar(50) NOT NULL,
    total int NOT NULL,
    productDetails JSON DEFAULT NULL,
    createdBy varchar(250) NOT NULL,   //người tạo bill
    primary key(id)
);