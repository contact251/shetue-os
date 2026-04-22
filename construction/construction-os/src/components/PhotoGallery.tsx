import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  ExternalLink, 
  Loader2,
  Filter,
  Maximize2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase, ProjectPhoto, Project } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const PhotoGallery: React.FC = () => {
  const [photos, setPhotos] = useState<ProjectPhoto[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadData, setUploadData] = useState({
    project_id: '',
    caption: '',
    category: 'progress' as const,
    file: null as File | null
  });

  const fetchData = async () => {
    try {
      const { data: projectsData } = await supabase.from('projects').select('*');
      
      let query = supabase.from('project_photos').select('*').order('created_at', { ascending: false });
      if (selectedProject !== 'all') query = query.eq('project_id', selectedProject);
      if (selectedCategory !== 'all') query = query.eq('category', selectedCategory);
      
      const { data: photosData } = await query;

      if (projectsData) setProjects(projectsData);
      if (photosData) setPhotos(photosData);
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedProject, selectedCategory]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadData.file || !uploadData.project_id) return;

    setIsUploading(true);
    try {
      // 1. Upload to Supabase Storage
      const fileExt = uploadData.file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${uploadData.project_id}/${fileName}`;

      const { error: uploadError, data: uploadResult } = await supabase.storage
        .from('project-photos')
        .upload(filePath, uploadData.file);

      if (uploadError) {
        if (uploadError.message.includes('bucket not found')) {
          alert('Please create a public bucket named "project-photos" in your Supabase Storage dashboard.');
        }
        throw uploadError;
      }

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('project-photos')
        .getPublicUrl(filePath);

      // 3. Save to Database
      const { error: dbError } = await supabase
        .from('project_photos')
        .insert([{
          project_id: uploadData.project_id,
          image_url: publicUrl,
          caption: uploadData.caption,
          category: uploadData.category
        }]);

      if (dbError) throw dbError;

      setIsUploadOpen(false);
      setUploadData({ project_id: '', caption: '', category: 'progress', file: null });
      fetchData();
    } catch (error) {
      console.error('Error uploading photo:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const deletePhoto = async (id: string, url: string) => {
    if (!confirm('Are you sure you want to delete this photo?')) return;

    try {
      // Extract path from URL
      const path = url.split('project-photos/').pop();
      if (path) {
        await supabase.storage.from('project-photos').remove([path]);
      }
      
      await supabase.from('project_photos').delete().eq('id', id);
      fetchData();
    } catch (error) {
      console.error('Error deleting photo:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-screen bg-zinc-50">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 bg-zinc-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">Site Photos</h1>
          <p className="text-zinc-500">Visual proof of work and progress documentation.</p>
        </div>
        <Button 
          onClick={() => setIsUploadOpen(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white gap-2 shadow-lg shadow-orange-500/20"
        >
          <Camera className="w-4 h-4" />
          Upload Photo
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <Select value={selectedProject} onValueChange={setSelectedProject}>
          <SelectTrigger className="w-[200px] bg-white border-zinc-200">
            <SelectValue placeholder="Project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {projects.map(p => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[150px] bg-white border-zinc-200">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="before">Before</SelectItem>
            <SelectItem value="progress">Progress</SelectItem>
            <SelectItem value="after">After</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Photo Grid */}
      {photos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border-2 border-dashed border-zinc-200">
          <ImageIcon className="w-12 h-12 text-zinc-300 mb-4" />
          <p className="text-zinc-500 font-medium">No photos found for the selected filters.</p>
          <Button variant="link" onClick={() => setIsUploadOpen(true)} className="text-orange-500">
            Upload your first site photo
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {photos.map((photo) => (
            <Card key={photo.id} className="group border-none shadow-sm bg-white overflow-hidden hover:shadow-md transition-all">
              <div className="relative aspect-square overflow-hidden">
                <img 
                  src={photo.image_url} 
                  alt={photo.caption || 'Site photo'} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button size="icon" variant="secondary" className="rounded-full h-9 w-9" asChild>
                    <a href={photo.image_url} target="_blank" rel="noopener noreferrer">
                      <Maximize2 className="w-4 h-4" />
                    </a>
                  </Button>
                  <Button 
                    size="icon" 
                    variant="destructive" 
                    className="rounded-full h-9 w-9"
                    onClick={() => deletePhoto(photo.id, photo.image_url)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <Badge className={cn(
                  "absolute top-3 left-3 font-bold uppercase text-[10px] tracking-widest",
                  photo.category === 'before' ? "bg-amber-500" :
                  photo.category === 'after' ? "bg-emerald-500" : "bg-blue-500"
                )}>
                  {photo.category}
                </Badge>
              </div>
              <CardContent className="p-4">
                <p className="text-sm font-medium text-zinc-900 line-clamp-2 min-h-[2.5rem]">
                  {photo.caption || 'No caption provided'}
                </p>
                <div className="mt-3 flex items-center justify-between text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                  <span>{projects.find(p => p.id === photo.project_id)?.name}</span>
                  <span>{format(new Date(photo.created_at), 'MMM dd, yyyy')}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white">
          <DialogHeader>
            <DialogTitle>Upload Site Photo</DialogTitle>
            <DialogDescription>Document progress with visual proof.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpload} className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Project</label>
              <Select 
                value={uploadData.project_id} 
                onValueChange={(v) => setUploadData({...uploadData, project_id: v})}
              >
                <SelectTrigger className="border-zinc-200">
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select 
                value={uploadData.category} 
                onValueChange={(v: any) => setUploadData({...uploadData, category: v})}
              >
                <SelectTrigger className="border-zinc-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="before">Before</SelectItem>
                  <SelectItem value="progress">Progress</SelectItem>
                  <SelectItem value="after">After</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Caption</label>
              <Input 
                placeholder="e.g. Ground floor slab casting complete" 
                value={uploadData.caption}
                onChange={(e) => setUploadData({...uploadData, caption: e.target.value})}
                className="border-zinc-200"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Photo</label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-zinc-200 border-dashed rounded-lg cursor-pointer bg-zinc-50 hover:bg-zinc-100 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 text-zinc-400 mb-2" />
                    <p className="text-xs text-zinc-500">
                      {uploadData.file ? uploadData.file.name : 'Click to upload or drag and drop'}
                    </p>
                  </div>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => setUploadData({...uploadData, file: e.target.files?.[0] || null})}
                  />
                </label>
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="submit" 
                className="bg-orange-500 hover:bg-orange-600 text-white w-full"
                disabled={isUploading || !uploadData.file || !uploadData.project_id}
              >
                {isUploading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Upload to Site Gallery
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PhotoGallery;
