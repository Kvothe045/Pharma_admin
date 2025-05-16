"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckedState } from "@radix-ui/react-checkbox";
import axios from "axios";
import { Trash } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import * as z from "zod";

import { AlertModal } from "@/components/modals/alert-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Heading } from "@/components/ui/heading";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

// --- form schema & TS types ----------------------------------------
const formSchema = z.object({
  name: z.string().min(1),
  percentage: z.coerce.number().min(0).max(100),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  productIds: z.array(z.string()).optional(),
});

type DiscountFormValues = z.infer<typeof formSchema>;

type FormProduct = {
  id: string;
  name: string;
  price: string;
};

type FormDiscount = {
  id: string;
  name: string;
  description?: string;
  percentage: number;
  isActive: boolean;
  products: FormProduct[];
};

interface DiscountFormProps {
  initialData: FormDiscount | null;
  products: FormProduct[];
}

// --- component ------------------------------------------------------
export const DiscountForm: React.FC<DiscountFormProps> = ({
  initialData,
  products,
}) => {
  const params = useParams();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const title       = initialData ? "Edit discount"    : "Create discount";
  const descText    = initialData ? "Edit a discount"   : "Add a new discount";
  const toastMsg    = initialData ? "Discount updated." : "Discount created.";
  const submitLabel = initialData ? "Save changes"     : "Create";

  const form = useForm<DiscountFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          percentage: initialData.percentage,
          description: initialData.description || "",
          isActive: initialData.isActive,
          productIds: initialData.products.map((p) => p.id),
        }
      : {
          name: "",
          percentage: 0,
          description: "",
          isActive: true,
          productIds: [],
        },
  });

  const onSubmit = async (data: DiscountFormValues) => {
    try {
      setLoading(true);
      if (initialData) {
        await axios.patch(
          `/api/${params.storeId}/discounts/${params.discountId}`,
          data
        );
      } else {
        await axios.post(`/api/${params.storeId}/discounts`, data);
      }
      toast.success(toastMsg);
      router.refresh();
      router.push(`/${params.storeId}/discounts`);
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(
        `/api/${params.storeId}/discounts/${params.discountId}`
      );
      toast.success("Discount deleted.");
      router.refresh();
      router.push(`/${params.storeId}/discounts`);
    } catch {
      toast.error(
        "Make sure you removed all products from this discount first."
      );
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        isLoading={loading}
      />

      <div className="flex items-center justify-between">
        <Heading title={title} description={descText} />
        {initialData && (
          <Button
            disabled={loading}
            variant="destructive"
            size="icon"
            onClick={() => setOpen(true)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </div>

      <Separator />

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 w-full"
        >
          {/* Name, Percentage, Description, Active */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={loading}
                      placeholder="Discount name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="percentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Percentage (%)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      disabled={loading}
                      placeholder="10"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={loading}
                      placeholder="Discount description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked: CheckedState) =>
                        field.onChange(checked === true)
                      }
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Active</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      This discount will be applied to selected products.
                    </p>
                  </div>
                </FormItem>
              )}
            />
          </div>

          {/* Products multi‑select */}
          <Card>
            <CardHeader>
              <CardTitle>Products</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="productIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Products</FormLabel>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {products.map((product) => (
                        <div
                          key={product.id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            checked={field.value?.includes(product.id) ?? false}
                            onCheckedChange={(checked: CheckedState) => {
                              const list = field.value ?? [];
                              const next = checked === true
                                ? [...list, product.id]
                                : list.filter((id) => id !== product.id);
                              field.onChange(next);
                            }}
                            id={product.id}
                          />
                          <label
                            htmlFor={product.id}
                            className="text-sm font-medium leading-none"
                          >
                            {product.name} — ${product.price}
                          </label>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Button
            disabled={loading}
            className="ml-auto"
            type="submit"
          >
            {submitLabel}
          </Button>
        </form>
      </Form>
    </>
  );
};
