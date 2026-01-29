
import { prisma } from "../lib/prisma.js";

/* =========================
   CREATE DEPARTMENT
========================= */


export const createDepartment=async(req,res)=>{
    try {
        const {departmentName,description,}=req.body;
        if(!departmentName || !description){
            return res.status(400).json({message:"Department name and description are required"})
        }
        const department=await prisma.department.create({
            data:{
                departmentName:departmentName,
                description:description,
            }
        })
        return res.status(201).json({message:"Department created successfully",department})
    } catch (error) {
        return res.status(500).json({message:"Internal Server Error",error})
    }
}

export const getAllDepartments=async(req,res)=>{
    try {
        const departments=await prisma.department.findMany()
        return res.status(200).json({message:"Departments fetched successfully",departments})
    } catch (error) {
        return res.status(500).json({message:"Internal Server Error",error})
    }
}
export const getDepartmentById=async(req,res)=>{
    try {
        const {id}=req.params;
        const department=await prisma.department.findUnique({
            where:{
                id:Number(id)
            }
        })
        return res.status(200).json({message:"Department fetched successfully",department})
    } catch (error) {
        return res.status(500).json({message:"Internal Server Error",error})
    }
}

export const updateDepartment=async(req,res)=>{
    try {
        const {id}=req.params;
        const department=await prisma.department.update({
            where:{
                id:Number(id)
            },
            data:{
                departmentName:req.body.departmentName,
                description:req.body.description,
            }
        })
        return res.status(200).json({message:"Department updated successfully",department})
    } catch (error) {
        return res.status(500).json({message:"Internal Server Error",error})
    }
}

export const deleteDepartment=async(req,res)=>{
    try {
        const {id}=req.params;
        const department=await prisma.department.delete({
            where:{
                id:Number(id)
            }
        })
        return res.status(200).json({message:"Department deleted successfully",department})
    } catch (error) {
        return res.status(500).json({message:"Internal Server Error",error})
    }
}