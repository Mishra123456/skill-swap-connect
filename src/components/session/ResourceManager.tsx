import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Link, FileText, Video, Plus, ExternalLink, Trash2, X } from 'lucide-react';

interface Resource {
    _id: string;
    title: string;
    type: 'link' | 'file' | 'video' | 'other';
    url: string;
    addedBy: { _id: string; name: string } | string;
    createdAt: string;
}

interface ResourceManagerProps {
    resources: Resource[];
    onAdd: (data: { title: string; type: string; url: string }) => Promise<void>;
    readOnly?: boolean;
}

const ResourceManager: React.FC<ResourceManagerProps> = ({ resources, onAdd, readOnly = false }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newResource, setNewResource] = useState({ title: '', type: 'link', url: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newResource.title || !newResource.url) return;

        setIsSubmitting(true);
        try {
            await onAdd(newResource);
            setNewResource({ title: '', type: 'link', url: '' });
            setIsAdding(false);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'video': return <Video className="h-5 w-5 text-red-400" />;
            case 'file': return <FileText className="h-5 w-5 text-blue-400" />;
            default: return <Link className="h-5 w-5 text-emerald-400" />;
        }
    };

    return (
        <div className="h-full flex flex-col bg-slate-900/50 rounded-2xl border border-white/10 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-slate-900/50">
                <h3 className="font-semibold text-gray-200">Resources</h3>
                {!readOnly && !isAdding && (
                    <Button
                        size="sm"
                        onClick={() => setIsAdding(true)}
                        className="bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/20"
                    >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Resource
                    </Button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {isAdding && (
                    <div className="bg-slate-800/50 rounded-xl p-4 mb-4 border border-indigo-500/30">
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="text-sm font-medium text-indigo-300">New Resource</h4>
                            <Button variant="ghost" size="sm" onClick={() => setIsAdding(false)} className="h-6 w-6 p-0 text-gray-400">
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <Input
                                placeholder="Resource Title"
                                value={newResource.title}
                                onChange={e => setNewResource({ ...newResource, title: e.target.value })}
                                className="bg-slate-900/50 border-slate-700"
                            />
                            <div className="flex gap-2">
                                <Select
                                    value={newResource.type}
                                    onValueChange={v => setNewResource({ ...newResource, type: v })}
                                >
                                    <SelectTrigger className="w-[120px] bg-slate-900/50 border-slate-700">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="link">Link</SelectItem>
                                        <SelectItem value="video">Video</SelectItem>
                                        <SelectItem value="file">File</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Input
                                    placeholder="URL"
                                    value={newResource.url}
                                    onChange={e => setNewResource({ ...newResource, url: e.target.value })}
                                    className="flex-1 bg-slate-900/50 border-slate-700"
                                />
                            </div>
                            <Button type="submit" disabled={isSubmitting} className="w-full bg-indigo-500 hover:bg-indigo-600">
                                {isSubmitting ? 'Adding...' : 'Add Resource'}
                            </Button>
                        </form>
                    </div>
                )}

                {resources.length === 0 && !isAdding ? (
                    <div className="text-center py-10 text-gray-500">
                        <Link className="h-10 w-10 mx-auto mb-2 opacity-20" />
                        <p>No resources shared yet</p>
                    </div>
                ) : (
                    resources.map(resource => (
                        <div key={resource._id} className="group flex items-center gap-3 p-3 rounded-xl bg-slate-800/30 border border-white/5 hover:bg-slate-800/50 transition-colors">
                            <div className="p-2 rounded-lg bg-slate-900 border border-white/5">
                                {getIcon(resource.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-gray-200 truncate">{resource.title}</h4>
                                <a
                                    href={resource.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-indigo-400 hover:underline truncate flex items-center gap-1"
                                >
                                    {resource.url}
                                    <ExternalLink className="h-3 w-3" />
                                </a>
                            </div>
                            <div className="text-xs text-gray-500 hidden sm:block">
                                {typeof resource.addedBy === 'object' ? resource.addedBy.name : 'Unknown'}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ResourceManager;
