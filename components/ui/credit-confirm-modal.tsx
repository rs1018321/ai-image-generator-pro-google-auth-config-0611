"use client";

import * as React from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

import { Button } from "@/components/ui/button";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useTranslations } from "next-intl";

interface CreditConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  credits: number;
  leftCredits: number;
}

export default function CreditConfirmModal({
  open,
  onOpenChange,
  onConfirm,
  credits,
  leftCredits,
}: CreditConfirmModalProps) {
  const t = useTranslations();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle style={{ 
              fontFamily: "'Comic Sans MS', 'Marker Felt', cursive",
              color: '#679fb5',
              fontSize: '24px'
            }}>
              确认生成图片
            </DialogTitle>
            <DialogDescription style={{ 
              fontFamily: "'Comic Sans MS', 'Marker Felt', cursive",
              fontSize: '16px',
              color: '#666'
            }}>
              生成图片将消耗 {credits} 个积分
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4" style={{ 
            fontFamily: "'Comic Sans MS', 'Marker Felt', cursive"
          }}>
            <div className="flex justify-between items-center mb-4">
              <span style={{ fontSize: '16px', color: '#333' }}>当前积分余额：</span>
              <span style={{ 
                fontSize: '18px', 
                fontWeight: 'bold', 
                color: leftCredits >= credits ? '#4CAF50' : '#f44336' 
              }}>
                {leftCredits} 积分
              </span>
            </div>
            
            <div className="flex justify-between items-center mb-4">
              <span style={{ fontSize: '16px', color: '#333' }}>本次消耗：</span>
              <span style={{ 
                fontSize: '18px', 
                fontWeight: 'bold', 
                color: '#ff9800' 
              }}>
                -{credits} 积分
              </span>
            </div>
            
            <div className="flex justify-between items-center border-t pt-2">
              <span style={{ fontSize: '16px', color: '#333' }}>生成后余额：</span>
              <span style={{ 
                fontSize: '18px', 
                fontWeight: 'bold', 
                color: leftCredits >= credits ? '#4CAF50' : '#f44336' 
              }}>
                {Math.max(0, leftCredits - credits)} 积分
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={handleCancel}
              className="flex-1"
              style={{
                fontFamily: "'Comic Sans MS', 'Marker Felt', cursive",
                fontSize: '16px'
              }}
            >
              取消
            </Button>
            <Button 
              onClick={handleConfirm}
              disabled={leftCredits < credits}
              className="flex-1"
              style={{
                fontFamily: "'Comic Sans MS', 'Marker Felt', cursive",
                fontSize: '16px',
                backgroundColor: leftCredits >= credits ? '#679fb5' : '#ccc',
                borderColor: leftCredits >= credits ? '#679fb5' : '#ccc'
              }}
            >
              {leftCredits >= credits ? '确认生成' : '积分不足'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle style={{ 
            fontFamily: "'Comic Sans MS', 'Marker Felt', cursive",
            color: '#679fb5',
            fontSize: '24px'
          }}>
            确认生成图片
          </DrawerTitle>
          <DrawerDescription style={{ 
            fontFamily: "'Comic Sans MS', 'Marker Felt', cursive",
            fontSize: '16px',
            color: '#666'
          }}>
            生成图片将消耗 {credits} 个积分
          </DrawerDescription>
        </DrawerHeader>
        
        <div className="px-4 py-4" style={{ 
          fontFamily: "'Comic Sans MS', 'Marker Felt', cursive"
        }}>
          <div className="flex justify-between items-center mb-4">
            <span style={{ fontSize: '16px', color: '#333' }}>当前积分余额：</span>
            <span style={{ 
              fontSize: '18px', 
              fontWeight: 'bold', 
              color: leftCredits >= credits ? '#4CAF50' : '#f44336' 
            }}>
              {leftCredits} 积分
            </span>
          </div>
          
          <div className="flex justify-between items-center mb-4">
            <span style={{ fontSize: '16px', color: '#333' }}>本次消耗：</span>
            <span style={{ 
              fontSize: '18px', 
              fontWeight: 'bold', 
              color: '#ff9800' 
            }}>
              -{credits} 积分
            </span>
          </div>
          
          <div className="flex justify-between items-center border-t pt-2">
            <span style={{ fontSize: '16px', color: '#333' }}>生成后余额：</span>
            <span style={{ 
              fontSize: '18px', 
              fontWeight: 'bold', 
              color: leftCredits >= credits ? '#4CAF50' : '#f44336' 
            }}>
              {Math.max(0, leftCredits - credits)} 积分
            </span>
          </div>
        </div>

        <DrawerFooter className="pt-2">
          <Button 
            onClick={handleConfirm}
            disabled={leftCredits < credits}
            style={{
              fontFamily: "'Comic Sans MS', 'Marker Felt', cursive",
              fontSize: '16px',
              backgroundColor: leftCredits >= credits ? '#679fb5' : '#ccc',
              borderColor: leftCredits >= credits ? '#679fb5' : '#ccc'
            }}
          >
            {leftCredits >= credits ? '确认生成' : '积分不足'}
          </Button>
          <DrawerClose asChild>
            <Button 
              variant="outline"
              style={{
                fontFamily: "'Comic Sans MS', 'Marker Felt', cursive",
                fontSize: '16px'
              }}
            >
              取消
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
} 