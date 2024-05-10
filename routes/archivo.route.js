import path from 'path'
import { Router } from "express";
import { readFile, rename, unlink, writeFile } from "fs/promises";
import slugify from 'slugify';

const router = Router()

const __dirname = import.meta.dirname;

function getFormattedDate() {
    const now = new Date();
    const day = now.getDate() < 10 ? `0${now.getDate()}` : now.getDate();
    const month =
      now.getMonth() + 1 < 10 ? `0${now.getMonth() + 1}` : now.getMonth() + 1;
    const year = now.getFullYear();
    return `${day}/${month}/${year}`;
  }

router.get('/', (req, res) => {

    //query params o query strings
    const {success, error} = req.query     
    console.log({success, error})
    return res.render('archivos', {success, error})
})

//crear los archivos
router.post('/crear', async(req, res) => {
    
    try{
        //req.body
        const {archivo, contenido} = req.body

        if(!archivo || !contenido || !archivo.trim() || !contenido.trim() ){
            console.log("todos los campos son obligatorios")
            return res.status(400).redirect('/archivos?error=todos los campos son obligatorios')
        }

        const slug = slugify(archivo, {
            trim: true,
            lower: true,
            strict: true 
        })

        const ruta = path.join(__dirname, `../data/archivos/${slug}.txt`);
        const fecha = getFormattedDate();
        const contenidoConFecha = `${fecha} ${contenido}`;
    
        await writeFile(ruta, contenidoConFecha);
    
        return res.status(201).redirect('/archivos?success=se creó el archivo con éxito')
    }catch (error){
        console.log(error)
        return res.status(500).redirect('/archivos?error=error al crear el archivo')
    }
    
})

router.get('/leer', async(req, res) => {
    try {
        const {archivo} = req.query

        const slug = slugify(archivo, {
            trim: true,
            lower: true,
            strict: true 
        })

        //crear una ruta a donde lleguen los archivos creados 
        const ruta = path.join(__dirname, `../data/archivos/${slug}.txt`)

        const contenido = await readFile(ruta, 'utf-8')

        return res.render('archivos', { success: contenido })

    }catch (error){
        console.log(error)
        if(error.code === 'ENOENT'){
            return res.status(404).redirect('/archivos?error=No se encuentra este archivo')
        }
        return res.status(500).redirect('/archivos?error=error al leer el archivo')
    }
})

router.post('/renombrar', async(req, res) => {
    try{
        const {archivo, nuevoNombre} = req.body

        const slug = slugify(archivo, {
            trim: true,
            lower: true,
            strict: true 
        })
        
        const nuevoSlug = slugify(nuevoNombre, {
            trim: true,
            lower: true,
            strict: true 
        })
        const viejaRuta = path.join(__dirname, `../data/archivos/${slug}.txt`)
        const nuevaRuta = path.join(__dirname, `../data/archivos/${nuevoSlug}.txt`)

        await rename(viejaRuta, nuevaRuta)
        const mensaje = `Se renombró con éxito el archivo "${archivo}" a "${nuevoNombre}"`;

        return res.status(200).redirect(`/archivos?success=${mensaje}`);


    }catch (error){
        console.log(error)
        if(error.code === 'ENOENT'){
            return res.status(404).redirect('/archivos?error=No se encuentra este archivo')
        }
        return res.status(500).redirect('/archivos?error=error al leer el archivo')
    }
})


router.post('/eliminar', async(req, res) => {
    try{
        const {archivo} = req.body
        const slug =  slugify(archivo, {
            trim: true,
            lower: true,
            strict: true,
        })
        const ruta = path.join(__dirname, `../data/archivos/${slug}.txt`)

        await unlink(ruta)
        return res.status(200).redirect('/archivos?success=se eliminó con exito el archivo')

    }catch(error){
        if(error.code === 'ENOENT'){
            return res.status(404).redirect('/archivos?error=No se encuentra este archivo')
        }
        return res.status(500).redirect('/archivos?error=error al borrar el archivo')
    }
})

export default router;